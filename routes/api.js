var express = require('express');
var router = express.Router();
var dataDriver = require('../drivers/datadriver');

router.get('/', function(_, res, _) {
    res.send({response: "200"});
});

router.get('/consoles', async function(req, res, _) {
    res.send(await dataDriver.getConsoles());
});

module.exports = router;