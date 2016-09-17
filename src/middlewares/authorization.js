import {verify} from 'token';

export default async function(req, res, next) {
	const authorizationToken = req.get('Authorization');
	if (authorizationToken) {
		try {
			const payload = verify(authorizationToken);
			req.username = payload.username;
			next();
		} catch (error) {
			next(error); // @TODO
		}
	} else {
		req.username = null;
		next();
	}
}