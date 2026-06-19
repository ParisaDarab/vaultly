import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createTransfer } from '../controllers/transferController.js';

const router = Router();
router.post('/', protect, createTransfer);

export default router;
