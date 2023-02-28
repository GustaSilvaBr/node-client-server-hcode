
const restify = require('restify-clients');
const assert = require('assert');
var express = require('express');
var router = express.Router();

const serverToRequest = 'http://localhost:4000';

const client = restify.createJsonClient({
  url: serverToRequest
});

// client.basicAuth('$login','$password'); -> restFull auth

/* GET users listing. */
router.get('/', function (requestExpress, responseExpress, next) {
  //res.send('respond with a resource');Invés de devolver uma requisição
  //para o client que fez a chamada iremos realizar uma requisição para outro server

  client.get('/users', function (err, requestRestify, responseRestify, obj) {
    assert.ifError(err);

    responseExpress.end(JSON.stringify(obj, null, 2));
  });
});

module.exports = router;
