const CountryList = require('../models/countrylist');

exports.getAll = async (req, res) => {
  try {
    const countries = await CountryList.findAll({ order: [['name', 'ASC']] });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching countries' });
  }
};