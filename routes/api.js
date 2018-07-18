var express = require('express');
var router = express.Router();
var dataDriver = require('../drivers/datadriver');

router.get('/', function(_, res, _) {
    res.send({response: "200"});
})

module.exports = router;