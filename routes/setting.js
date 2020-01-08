const Routes = require('express').Router();

const SettingController = require('../controllers/setting');

Routes.post('/settingSave', SettingController.save_setting);
Routes.post('/settingUpdate', SettingController.update_setting);
Routes.get('/settingGetAll', SettingController.get_all_settings); 

module.exports = Routes;