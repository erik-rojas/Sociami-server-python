const Routes = require('express').Router();

const CompanyController = require('../controllers/company');
Routes.post('/company', CompanyController.save_company);
Routes.get('/company', CompanyController.fetch_company);
Routes.delete('/company', CompanyController.delete_company);
Routes.put('/company/:id', CompanyController.update_company);
Routes.post('/company/:id/upload-image', CompanyController.upload_company_image)

module.exports = Routes;