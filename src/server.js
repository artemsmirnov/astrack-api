import config from 'config';
import app from './app';

const port = config.get('port');
app.listen(port, () => {
    winston.info(`astrack listening port ${port}`)
});
