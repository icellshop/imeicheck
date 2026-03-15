const { Service } = require('../models');
const XLSX = require('xlsx');

function normalizeServiceRow(row) {
  return {
    service_id: row.service_id ? Number(row.service_id) : undefined,
    service_name: row.service_name,
    cost: row.cost,
    object: row.object,
    limit: row.limit,
    price_guest: row.price_guest,
    price_registered: row.price_registered,
    price_premium: row.price_premium,
    price_pro: row.price_pro,
    description: row.description,
    active: row.active,
  };
}

// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    console.error('Error en getAllServices:', error);
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};

// Exportar servicios a Excel para edición offline
exports.exportServicesExcel = async (_req, res) => {
  try {
    const services = await Service.findAll({
      order: [['service_id', 'ASC']],
      raw: true,
    });

    const rows = services.map((service) => ({
      service_id: service.service_id,
      service_name: service.service_name,
      description: service.description || '',
      object: service.object || '',
      limit: service.limit ?? '',
      cost: service.cost ?? '',
      price_guest: service.price_guest ?? '',
      price_registered: service.price_registered ?? '',
      price_premium: service.price_premium ?? '',
      price_pro: service.price_pro ?? '',
      active: service.active === true,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        'service_id',
        'service_name',
        'description',
        'object',
        'limit',
        'cost',
        'price_guest',
        'price_registered',
        'price_premium',
        'price_pro',
        'active',
      ],
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xls' });

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="services-export.xls"');
    res.send(buffer);
  } catch (error) {
    console.error('Error en exportServicesExcel:', error);
    res.status(500).json({ error: 'Error al exportar servicios' });
  }
};

// Obtener un servicio por ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (error) {
    console.error('Error en getServiceById:', error);
    res.status(500).json({ error: 'Error al obtener el servicio' });
  }
};

// Crear un servicio (solo admin)
exports.createService = async (req, res) => {
  try {
    const {
      service_name,
      cost,
      object,
      limit,
      price_guest,
      price_registered,
      price_premium,
      description,
      active,
      price_pro
    } = req.body;

    const newService = await Service.create({
      service_name,
      cost,
      object,
      limit,
      price_guest,
      price_registered,
      price_premium,
      description,
      active,
      price_pro
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error('Error en createService:', error);
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
};

// Actualizar un servicio (solo admin)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    await service.update(req.body);

    res.json(service);
  } catch (error) {
    console.error('Error en updateService:', error);
    res.status(500).json({ error: 'Error al actualizar el servicio' });
  }
};

// Eliminar un servicio (solo admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    await service.destroy();

    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteService:', error);
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
};

// Actualización masiva de servicios (bulk)
exports.bulkUpdate = async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Debe enviar un arreglo.' });
    }
    let ok = 0, fail = 0, errors = [];
    for (const up of updates) {
      if (!up.service_id) {
        fail++; continue;
      }
      try {
        const s = await Service.findByPk(up.service_id);
        if (!s) { fail++; continue; }
        Object.keys(up).forEach(key => {
          if (key !== 'service_id' && typeof up[key] !== 'undefined') s[key] = up[key];
        });
        await s.save();
        ok++;
      } catch (e) {
        fail++;
        errors.push({ id: up.service_id, error: e.message });
      }
    }
    res.json({ updated: ok, failed: fail, errors });
  } catch (e) {
    res.status(500).json({ error: 'Error en actualización masiva', details: e.message });
  }
};

// Crear servicios en bulk desde un archivo Excel
exports.bulkCreateFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  try {
    // Leer el archivo Excel desde buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Convertir la hoja a JSON (array de objetos)
    const services = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (!services.length) {
      return res.status(400).json({ error: 'El archivo no tiene datos' });
    }

    let created = 0;
    let updated = 0;

    for (const rawRow of services) {
      const row = normalizeServiceRow(rawRow);

      if (!row.service_name && !row.service_id) {
        continue;
      }

      let service = null;

      if (row.service_id) {
        service = await Service.findByPk(row.service_id);
      }

      if (!service && row.service_name) {
        service = await Service.findOne({ where: { service_name: row.service_name } });
      }

      const payload = {
        service_name: row.service_name,
        description: row.description,
        object: row.object,
        limit: row.limit,
        cost: row.cost,
        price_guest: row.price_guest,
        price_registered: row.price_registered,
        price_premium: row.price_premium,
        price_pro: row.price_pro,
        active: row.active,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || typeof payload[key] === 'undefined' || payload[key] === '') {
          delete payload[key];
        }
      });

      if (service) {
        await service.update(payload);
        updated++;
      } else {
        if (row.service_id) {
          payload.service_id = row.service_id;
        }
        await Service.create(payload);
        created++;
      }
    }

    res.status(201).json({
      message: `Import completed. Created ${created} services and updated ${updated} services.`,
      created,
      updated,
    });
  } catch (error) {
    console.error('Error al crear servicios desde Excel:', error);
    res.status(500).json({ error: 'Error procesando el archivo' });
  }
};