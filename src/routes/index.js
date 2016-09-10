import { Router } from 'express';

import users from './users';
import activities from './activities';

const router = Router();

router.use('/users', users);
router.use('/activities', activities);

export default router;