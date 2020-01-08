const Routes = require('express').Router();

const TasksController = require('../controllers/tasksManagement');

Routes.get('/taskSave', TasksController.save_task);
Routes.post('/taskSavePost', TasksController.save_task_post);
Routes.get('/taskSetPublished', TasksController.set_task_published);
Routes.get('/tasksDrop', TasksController.drop_tasks);
Routes.get('/taskDelete', TasksController.drop_task);
Routes.get('/taskDeleteByEmail', TasksController.drop_tasks_by_email);
Routes.get('/tasksGet', TasksController.get_tasks);
Routes.get('/tasksGetForUser', TasksController.get_user_tasks);
Routes.get('/taskGetById', TasksController.get_task_by_id);
Routes.get('/taskHasAssignees', TasksController.is_task_has_assignees);
Routes.get('/taskAssigneesGet', TasksController.get_task_assignees);
Routes.post('/taskAssign', TasksController.assign_task);
Routes.post('/taskCancel', TasksController.unassign_task);
Routes.post('/taskLeave', TasksController.leave_task);
Routes.post('/taskStatusChange', TasksController.change_task_status);
module.exports = Routes;