import {verify} from 'token';
import HttpError from 'HttpError';

export default async function(req, res, next) {
	const authorizationToken = req.get('Authorization');
	if (authorizationToken) {
		try {
			const payload = verify(authorizationToken);
			req.username = payload.username;
			next();
		} catch (error) {
			throw new HttpError(400, 'invalid_token');
		}
	} else {
		req.username = null;
		next();
	}
}