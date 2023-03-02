const restify = require("restify-clients");
const assert = require("assert");
var express = require("express");
var router = express.Router();

const serverToRequest = "http://127.0.0.1:4000";

const client = restify.createJsonClient({
  url: serverToRequest,
});

// client.basicAuth('$login','$password'); -> restFull auth

/* GET users listing. */
router.get("/", function (requestToRestify, responseFromRestify, next) {
  //res.send('respond with a resource');Invés de devolver uma requisição
  //para o client que fez a chamada iremos realizar uma requisição para outro server

  client.get(
    "/users",
    function (err, requestToRestAPI, responseFromRestAPI, obj) {
      assert.ifError(err);

      responseFromRestify.json(obj);
    }
  );
});

/*Get user by id*/
router.get("/:id", function (requestToRestify, responseFromRestify, next) {
  client.get(
    `/users/${requestToRestify.params.id}`,
    function (err, requestToRestAPI, responseFromRestAPI, obj) {
      assert.ifError(err);

      responseFromRestify.json(obj);
    }
  );
});

/*Update user*/

router.put("/:id", function (requestToRestify, responseFromRestify, next) {
  client.put(
    `/users/${requestToRestify.params.id}`,
    requestToRestify.body,
    function (err, requestToRestAPI, responseFromRestAPI, obj) {
      assert.ifError(err);

      responseFromRestify.json(obj);
    }
  );
});

router.delete("/:id", function (requestToRestify, responseFromRestify, next) {
  client.del(
    `/users/${requestToRestify.params.id}`,
    function (err, requestToRestAPI, responseFromRestAPI, obj) {
      assert.ifError(err);

      responseFromRestify.json(obj);
    }
  );//-> restify use the delete method as "del"
});


router.post("/", function (requestToRestify, responseFromRestify, next) {
  console.log('Response: ', requestToRestify.body);
  client.post('/users', requestToRestify.body,
    function (err, requestToRestAPI, responseFromRestAPI, obj) {
      assert.ifError(err);

      responseFromRestify.json(obj);
    }
  )
});


module.exports = router;
