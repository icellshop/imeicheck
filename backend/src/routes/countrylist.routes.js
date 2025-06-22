const express = require('express');
const router = express.Router();
const CountryList = require('../models/countrylist');

router.get('/', async (req, res) => {
  try {
    const countries = await CountryList.findAll({ order: [['name', 'ASC']] });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching countries' });
  }
});

module.exports = router;