const Axios = require('axios');
const Base64 = require('base-64');

const ConfigAPIs = require('../config/apis');

/********INDEED********/
exports.get_indeed_jobs = function(req, res) {
    let query = '';
    let country = '';
    let location = '';
    if (req.query.query) { query = req.query.query; }
    if (req.query.country) { country = req.query.country; }
    if (req.query.location) { query = req.query.location; }
  
    const queryParams = `&q=${query}&l=${location}&co=${country}&v=2&format=json`;
    const url = `${ConfigAPIs.Indeed.BaseURL}/ads/apisearch?publisher=${ConfigAPIs.Indeed.Publisher}` + queryParams;
    
    Axios.get(url)
    .then((response)=>{
      res.send(response.data);
    })
    .catch((err)=>{
        console.log(err)
        res.send(err);
    })
};
/**********************/

/********EVENTBRITE********/
exports.get_eventbrite_events = function(req, res) {
    let query = '';
    let location = '';
    if (req.query.query) { query = req.query.query;}
    if (req.query.location) { location = req.query.location;}
  
    const url = `${ConfigAPIs.EventBrite.BaseURL}/events/search/?token=${ConfigAPIs.EventBrite.Token}&q=${query}&location.address=${location}`;
  
    Axios.get(url)
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      res.send(error);
    });
};
/**********************/

/********UDEMY********/
exports.get_udemy_courses = function(req, res) {
    let query = '';
    if (req.query.query) {
      query = req.query.query;
    }
  
    Axios({
      method:'get',
      url:`${ConfigAPIs.Udemy.BaseURL}/courses`,
      responseType:'json',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Basic '+ Base64.encode(ConfigAPIs.Udemy.AuthorizationKey)},
      params: {
        search: query
      },
    }).then(function(response) {
      res.send(response.data);
    }).catch(function(error) {
      res.send(error);
    });
};
/**********************/

/********FREELANCER*GIGS********/
exports.get_freelancer_gigs = function(req, res) {
    let query = '';
    let other_query = '';
  
    if (req.query.query) {
      query = req.query.query;
    }
  
    if (req.query.other_query) {
      other_query = req.query.other_query;
    }
    
    const url = `${ConfigAPIs.Freelancer.BaseURL}/projects/active/?query=${query}&or_search_query=${other_query}&limit=50`;
  
    Axios.get(url)
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      res.send(error);
    });
};
/**********************/