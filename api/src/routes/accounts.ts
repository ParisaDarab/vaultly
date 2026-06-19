import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createAccount, listAccounts, deposit } from '../controllers/accountController.js';

const router = Router();
router.use(protect); // every account route needs a valid token

router.post('/', createAccount);
router.get('/', listAccounts);
router.post('/:id/deposit', deposit);

export default router;
