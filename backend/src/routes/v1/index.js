const { Router } = require('express');
const chatRoutes = require('./chat.routes');
const healthRoutes = require('./health.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
