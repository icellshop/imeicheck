const { Service } = require('../models');
const XLSX = require('xlsx');

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
    const services = XLSX.utils.sheet_to_json(worksheet);

    if (!services.length) {
      return res.status(400).json({ error: 'El archivo no tiene datos' });
    }

    // Crear en bulk
    const created = await Service.bulkCreate(services, { validate: true });

    res.status(201).json({
      message: `Se crearon ${created.length} servicios`,
      services: created,
    });
  } catch (error) {
    console.error('Error al crear servicios desde Excel:', error);
    res.status(500).json({ error: 'Error procesando el archivo' });
  }
};