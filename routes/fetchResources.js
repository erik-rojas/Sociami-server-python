const Routes = require('express').Router();
const Axios = require('axios');
const Base64 = require('base-64');

const ConfigAPIs = require('../config/apis');

/********INDEED********/
Routes.get('/fetchResource', (req, res) => {
  if (!req.query.resourcePath) {
    res.sendStatus(400);
  }

  const url = `http://sociamibucket.s3.amazonaws.com/${req.query.resourcePath}`;
  
  Axios.get(url)
  .then((response)=>{
    if (response.status == 200) {
      res.send(response.data);
    }
    else {
      res.send(response.status);
    }
  })
  .catch((err)=>{
      console.log(err)
      res.sendStatus(500);
  })

});
/**********************/

module.exports = Routes;