import Sequelize from 'sequelize';

const db = new Sequelize('astrack', 'postgres', '', {
	host: 'localhost',
	dialect: 'postgres',

	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

export default db;

export const User = db.define('user', {
	username: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	hash: Sequelize.STRING
}, {
	timestamps: false
});

export const Activity = db.define('activity', {
	name: Sequelize.STRING
}, {
	timestamps: false
});

export const Log = db.define('log', {
	summary: Sequelize.STRING,
	date: Sequelize.INTEGER,
	duration: Sequelize.INTEGER
}, {
	timestamps: false
});

Activity.belongsTo(User);
Log.belongsTo(Activity);

// Check connection
db.authenticate()
	.then(function() {
 		console.log('Connection has been established successfully.');

 		return db.sync({force: true});
	})
	.then(function() {
		console.log('Models synced');
	})
	.catch(function (err) {
		console.log('Unable to connect to the database:', err);
	});