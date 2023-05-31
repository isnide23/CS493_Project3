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
  password: { type: DataTypes.STRING, allowNull: false },
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

  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;

  const validatedUser = await User.create(userToInsert, UserClientFields)

  return validatedUser;
};

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById(id, includePassword) {
  const db = getDBReference();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray();
    return results[0];
  }
};
exports.getUserById = getUserById;

/*
 * Fetch a user from the DB based on user ID.
 */
exports.validateUser = async function (id, password) {
  const user = await getUserById(id, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  return authenticated;
};
