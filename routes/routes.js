const Routes = require('express').Router();

const ConfigMain = require('../config/main');

const Axios = require('axios');

Routes.get('/', function (req, res) {
    res.send("Welcome to Soqqle!");
});

Routes.get('/printconfig', function(req, res) {
    res.send(`This App URL: ${ConfigMain.getThisUrl()} Front-End URL: ${ConfigMain.getFrontEndUrl()} Database Name: ${ConfigMain.getDatabaseName()}`);
});

Routes.get('/privacyPolicyMin', function (req, res) {
    Axios.get("http://sociamibucket.s3.amazonaws.com/legal/privacy_policy_min.html")
    .then((result) => {
        res.send(result.data);
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(500);
    })
});

module.exports = Routes;