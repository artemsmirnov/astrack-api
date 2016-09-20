import { bootstrap } from 'db';

bootstrap()
	.then(() => {
		console.log('DB bootstraped');
	})
	.catch(err => {
		console.log('Error while bootstraping db', err);
	})
	.finally(() => {
		process.exit(0);
	});