const Routes = require('express').Router();

const TicketController = require('../controllers/ticket');
Routes.post('/ticket', TicketController.save_ticket);
Routes.get('/ticket', TicketController.fetch_ticket);
Routes.delete('/ticket', TicketController.delete_ticket);
Routes.get('/ticket/:id', TicketController.fetch_ticket_by_id);
Routes.put('/ticket/:id', TicketController.update_ticket);
Routes.put('/ticket/:id/patch', TicketController.patch_ticket);
Routes.post('/ticket/:id/comment', TicketController.add_comment);

module.exports = Routes;