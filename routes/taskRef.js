const Routes = require('express').Router();
const TaskRefCOntroller = require('../controllers/taskRef');

Routes.post('/taskRef', TaskRefCOntroller.save);
Routes.get('/taskRefs', TaskRefCOntroller.get_all);
Routes.put('/taskRef/:id', TaskRefCOntroller.update);
Routes.delete('/taskRefs', TaskRefCOntroller.delete);

module.exports = Routes;