const { Router } = require('express');
const chatController = require('../../controllers/chat.controller');

const router = Router();

router.post('/', chatController.chat);
router.get('/:sessionId/history', chatController.getHistory);

module.exports = router;
