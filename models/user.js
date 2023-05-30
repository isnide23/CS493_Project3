const { DataTypes } = require('sequelize')

const bcrypt = require('bcryptjs');
const passwordHash = await bcrypt.hash(User.password, 8);

const sequelize = require('../lib/sequelize')
const { Business} = require('./business')
const { Photo } = require('./photo')
const { Review } = require('./review')

const User = sequelize.define('user', {
  id : { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  admin: {type: DataTypes.BOOLEAN, allowNull: false }
})

/*
* Set up one-to-many relationship between User and Business.
*/
User.hasMany(Business, { foreignKey: { allowNull: false } })
Business.belongsTo(User)

/*
* Set up one-to-many relationship between User and Photo.
*/
User.hasMany(Photo, { foreignKey: { allowNull: false } })
Photo.belongsTo(User)

/*
* Set up one-to-many relationship between User and Review.
*/
User.hasMany(Review, { foreignKey: { allowNull: false } })
Review.belongsTo(User)

exports.User = User

/*
 * Export an array containing the names of fields the client is allowed to set
 * on users.
 */
exports.UserClientFields = [
    'id', 
    'name', 
    'email', 
    'password',
    'admin'
]

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(user, UserSchema);
  const db = getDBReference();
  const collection = db.collection('users');

  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;

  const result = await collection.insertOne(userToInsert);
  return result.insertedId;
};
