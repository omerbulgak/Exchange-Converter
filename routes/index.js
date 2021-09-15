const axios = require('axios');
const express = require('express');
const router = express.Router();
const {LRUCache} = require('../lib/cache/LRUCache');

const cache = new LRUCache();


router.get('/', function (req, res, next) {
  res.render('index', {title: 'Exchange Converter'});
});

router.post('/', async function (req, res, next) {
  const baseCurrency = req.body.baseCurrency;
  const quateCurrency = req.body.quateCurrency;
  const amount = +req.body.amount;

  const validationResult = validate(baseCurrency, quateCurrency, amount);
  if (validationResult.length > 0) {
    return res
      .status(405)
      .contentType('Application/json')
      .json({errors: validationResult})
      .end();
  }


  let rate = -1;
  const dataFromCache = getRateFromCache(baseCurrency, quateCurrency);

  if (dataFromCache) {
    rate = dataFromCache.value;
    console.log('from cache');
  } else {
    rate = await getRateFromAPI(baseCurrency, quateCurrency);
    setCache(baseCurrency, quateCurrency, rate)
    console.log('from API');
  }

  const exchangeInfo = getExchangeInfo(baseCurrency, quateCurrency, rate, amount);

  res.json(exchangeInfo);
});


function validate(baseCurrency, quateCurrency, amount) {
  const validationErrors = [];


  if (+baseCurrency === -1) {
    validationErrors.push({message: 'Please  select base currency'});
  }

  if (+quateCurrency === -1) {
    validationErrors.push({message: 'Please  select quote currency'});
  }

  if (+amount === 0) {
    validationErrors.push({message: 'Invalid amount'});
  }

  return validationErrors;
}

function getRateFromCache(baseCurrency, quateCurrency) {
  return cache.get(`${baseCurrency}-${quateCurrency}`);
}

function setCache(baseCurrency, quateCurrency, rate) {
  cache.put(`${baseCurrency}-${quateCurrency}`, rate);
}


async function getRateFromAPI(baseCurrency, quateCurrency) {
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  const apiKey = '4ed4ab18d6ac875bff79a3b8';
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;

  const response = await axios.get(url);
  return +response.data.conversion_rates[quateCurrency];
}

function getExchangeInfo(baseCurrency, quateCurrency, rate, amount) {
  const UNIT_RATE = 100;

  const conversationRate = rate / UNIT_RATE;
  const expectedAmount = +((amount * conversationRate).toFixed(2));

  return {
    expectedAmount,
    conversationRate,
    formattedInfo: `${amount / UNIT_RATE} ${baseCurrency} is ${expectedAmount} ${quateCurrency}`
  }
}

module.exports = router;
