const express = require('express');
const router = express.Router();

const middlewareAuth = require('../middleware/auth');
const checklistHandler = require('./checklist.controller');

router.use(middlewareAuth);

// Checklist Templates
router.route('/checklists/templates')
  .get(checklistHandler.getAllTemplate)
  .post(checklistHandler.createTemplate);

router.route('/checklists/templates/:templateId')
  .get(checklistHandler.getTemplate)
  .patch(checklistHandler.updateTemplate)
  .delete(checklistHandler.deleteTemplate);

router.route('/checklists/templates/:templateId/assigns')
  .post(checklistHandler.assignTemplate);

// Checklists items
router.get('/checklists/items', checklistHandler.getAllItem);
router.route('/checklists/:checklistId/items')
  .get(checklistHandler.getByIdWithItems)
  .post(checklistHandler.createItem);

router.route('/checklists/:checklistId/items/:itemId')
  .get(checklistHandler.getItem)
  .patch(checklistHandler.updateItem)
  .delete(checklistHandler.deleteItem);

router.post('/checklists/:checklistId/items/_bulk', checklistHandler.updateItemBulk);
router.get('/checklists/items/summaries', checklistHandler.summaryItem);

// Checklists
router.route('/checklists')
  .get(checklistHandler.getAll)
  .post(checklistHandler.create);

router.route('/checklists/:checklistId')
  .get(checklistHandler.getById)
  .patch(checklistHandler.update)
  .delete(checklistHandler.delete);

router.post('/checklists/complete', checklistHandler.completeItem);
router.post('/checklists/incomplete', checklistHandler.incompleteItem);

module.exports = router;