const Routes = require('express').Router();
const gaApi = require('ga-api');

Routes.get('/googleAnalytics', function(req, res) {

    const options = {
      clientId: "115474630232368748491",
      email: "soqqle-ga-service@operating-bird-193712.iam.gserviceaccount.com",
      key: "ga_key.pem",
      ids: "ga:168832627",
    };
   
    gaApi(Object.assign({}, options, {
        startDate: "2018-01-01",
        endDate: "2018-01-31",
        dimensions: "ga:eventCategory,ga:eventAction,ga:eventLabel,ga:date",
        metrics: "ga:eventValue",
    }), function(err, data) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        res.status(200);
        res.send(data);
      }
    });
  });

  module.exports = Routes;