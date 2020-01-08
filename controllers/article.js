const Article = require('../models/article');
const _ = require('lodash');
var scrape = require('html-metadata');

exports.save_article = (req, res) => {
  const article = new Article(req.body);

  article.save((err, article) => {
    if (err) {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    } else {
      res.status(200);
      res.send(article);
    }
  });
}

exports.fetch_article = (req, res) => {
  Article.find()
    .then(result => {
      return Promise.all(result.map(r =>  {
        if(validURL(r.urlLink)) {
          return scrape(r.urlLink, (error,m) => {
            if(!error) {
              m['data'] = r
              return m
            }else {
              return {data: r}
            }
          })
        }else {
          return {data: r}
        }
      })).then((meta) => {
        res.status(200);
        res.send(meta);
      })
    }).catch(err => {
      console.log(err);  // handle errors!
      res.sendStatus(500);
    });
}

exports.fetch_article_by_id = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    Article.findById(_id)
      .then(result => {
        res.status(200);
        res.send(result);
      }).catch(err => {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      });
  }
}

exports.update_article = (req, res) => {
  const _id = _.get(req, 'params.id');
  if (!_id) {
    res.sendStatus(404);
  } else {
    Article.update({ _id }, req.body, (err, data) => {
      if (err) {
        console.log(err);  // handle errors!
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send(data);
      }
    })
  }
}

exports.delete_article = (req, res) => {
  console.log(req.body.ids)
  Article.deleteMany({
    _id: {
      $in: req.body.ids
    }
  }, (err, doc) => {
    if (!err) {
      res.status(200);
      res.send(doc);
    }
    else {
      console.log("Error: " + err);
      res.sendStatus(500);
    }
  })
}

const validURL = (str) => {
  return /^(ftp|http|https):\/\/[^ "]+$/.test(str)
}