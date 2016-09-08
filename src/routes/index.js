import { Router } from 'express';

import users from './users';
import tracks from './tracks';

const router = Router();

router.use('/users', users);
router.use('/tracks', tracks);

export default router;