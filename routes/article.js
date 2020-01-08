const Routes = require('express').Router();
const ArticleController = require('../controllers/article.js');

Routes.post('/articles', ArticleController.save_article);
Routes.get('/articles', ArticleController.fetch_article);
Routes.get('/articles/:id', ArticleController.fetch_article_by_id);
Routes.put('/articles/:id', ArticleController.update_article);
Routes.delete('/articles/:ids', ArticleController.delete_article);

module.exports = Routes;