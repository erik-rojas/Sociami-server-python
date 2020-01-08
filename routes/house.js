const Routes = require('express').Router();
const HousesController = require('../controllers/houses');

Routes.get('/houses', HousesController.get_houses)
Routes.post('/houses', HousesController.save_house);
Routes.delete('/houses/:id', HousesController.delete_house)
Routes.put('/houses/:id', HousesController.update_house)
Routes.post('/houses/:id/upload-image', HousesController.upload_house_image)


module.exports = Routes;