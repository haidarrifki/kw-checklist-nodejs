const express = require('express');
const router = express.Router();

const checklistRoutes = require('../handlers/checklist.route');

router.use(checklistRoutes);
router.all('*', (req, res) => {
  return res.json({ message: 'no route and no API found with those values' });
});

module.exports = router;