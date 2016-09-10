import express from 'express';
import bodyParser from 'body-parser';
import routes from 'routes';
import authorization from 'middlewares/authorization';
import errorHandler from 'middlewares/errorHandler';
import { ready as dbReady } from 'db';

const app = express();

app.use(bodyParser.json());
app.use(authorization);

app.use('/api', routes);

app.use(errorHandler);

app.ready = dbReady;
app.resolveWhenReady = () => app.ready;

export default app;