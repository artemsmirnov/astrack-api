import token from 'token';

export default function(req, res, next) {
	const authorizationToken = req.get('Authorization');

	if (authorizationToken) {
		try {
			const payload = token.verify(authorizationToken);
			req.user = payload.user;
			next();
		} catch (error) {
			next(error); // @TODO
		}
	} else {
		req.user = null;
		next();
	}
}