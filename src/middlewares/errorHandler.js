import { HttpError } from 'HttpError';

export default function(err, req, res, next) {
	if (err instanceof HttpError) {
		res.status(err.statusCode).json({
			...err.payload,
			error: err.message
		});
	} else {
		next(err);
	}
}