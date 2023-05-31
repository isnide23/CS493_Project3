const { DataTypes } = require('sequelize')

const bcrypt = require('bcryptjs');

const sequelize = require('../lib/sequelize')
const { Business} = require('./business')
const { Photo } = require('./photo')
const { Review } = require('./review')

const User = sequelize.define('user', {
  id : { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  password: {
    type: DataTypes.STRING,
    set(value) {
      // Storing passwords in plaintext in the database is terrible.
      // Hashing the value with an appropriate cryptographic hash function is better.
      // Using the username as a salt is better.
      this.setDataValue('password', bcrypt.hash(userToInsert.password, 8));
    }
  },
  admin: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
})

/*
* Set up one-to-many relationship between User and Business.
*/
User.hasMany(Business, { foreignKey: { allowNull: false} })
Business.belongsTo(User)

// /*
// * Set up one-to-many relationship between User and Photo.
// */
User.hasMany(Photo, { foreignKey: { allowNull: false } })
Photo.belongsTo(User)

// /*
// * Set up one-to-many relationship between User and Review.
// */
// User.hasMany(Review, { foreignKey: { allowNull: false } })
// Review.belongsTo(User)

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

  // const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  // userToInsert.password = passwordHash;

  const validatedUser = await User.create(userToInsert, UserClientFields)

  return validatedUser;
};

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById(id, includePassword) {
  const user = await User.findOne({
    where: {
      id: id
    }
  });
  if (user === null) {
    return 'user not found';
  }
  return user;
};

/*
 * Fetch a user from the DB based on user email.
 */
async function getUserByEmail(email, includePassword) {
  const user = await User.findOne({
    where: {
      email: email
    }
  });
  if (user === null) {
    return 'user not found';
  }
  return user;
};

/*
 * Validate a user from the DB based on user ID.
 */
exports.validateUser = async function (email, password) {
  const user = await getUserByEmail(email, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  return authenticated;
};
