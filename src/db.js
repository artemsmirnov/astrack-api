import Sequelize from 'sequelize';
import bcrypt from 'bcrypt-as-promised';
import config from 'config';

const dbConf = config.get('db');

const db = new Sequelize(dbConf.name, 'postgres', '', {
	host: 'localhost',
	dialect: 'postgres',
	logging: false,
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

export default db;

export const User = db.define('user', {
	username: {
		type: 'citext',
		primaryKey: true,
		allowNull: false
	},
	hash: Sequelize.STRING
}, {
	timestamps: false,
	instanceMethods: {
		async setPassword(password) {
			this.set('hash', await bcrypt.hash(password, 8));
		},
		async verifyPassword(password) {
			try {
				await bcrypt.compare(password, this.hash);
				return true;
			} catch (err) {
				if (err instanceof bcrypt.MISMATCH_ERROR) {
					return false
				}
				throw err;
			}
		},
		toJSON() {
			const values = this.get({plain: true});

			delete values.hash;
			return values;
		}
	}
});

export const Activity = db.define('activity', {
	name: Sequelize.STRING
}, {
	timestamps: false,
	instanceMethods: {
		toJSON() {
			const values = this.get({plain: true});

			delete values.userUsername;
			return values;
		}
	},
	scopes: {
		includeLogs: () => ({
			include: [{
				model: Log,
				attributes: ['id', 'summary', 'date', 'duration']
			}]
		})
	}
});

User.hasMany(Activity);
Activity.belongsTo(User);

export const Log = db.define('log', {
	summary: Sequelize.STRING,
	date: Sequelize.INTEGER,
	duration: Sequelize.INTEGER
}, {
	timestamps: false
});

Activity.hasMany(Log);
Log.belongsTo(Activity);

export function clear() {
	return db.sync({
		match: /test$/,
		force: true
	});
}

export function bootstrap() {
	// @TODO add confirmation
	return db.sync();
}

export const ready = db.authenticate();