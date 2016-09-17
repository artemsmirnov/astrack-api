import { Router } from 'express';
import authorizedOnly from 'middlewares/authorizedOnly';

const tracks = Router();

tracks.use(authorizedOnly);

export default tracks;