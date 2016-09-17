import { User } from 'db';
import { HttpError } from 'HttpError';

export default async function(req, res, next) {
	try {
		if (!req.username) {
			throw new HttpError(403, 'access_denied');
		}

		req.user = await User.findOne({
			where: {
				username: req.username
			}
		});

		if (!req.user) {
			throw new HttpError(403, 'access_denied');
		}

		next();
	} catch (error) {
		next(error);
	}
}
