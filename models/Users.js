const { Sequelize, DataTypes } = require('sequelize')
const { Tweets } = require('./Tweets')
const { Like } = require('./Like')

const sequelize = new Sequelize('postgres://postgres:postgres@localhost/twitter')

const User = sequelize.define('User', {
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    loginid: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: null,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    freezeTableName: true,
})

User.hasMany(Tweets, {
    foreignKey: 'userId',
    onDelete: 'cascade',
})

Tweets.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(Like, {
    foreignKey: 'userId',
    onDelete: 'cascade',
})

Like.belongsTo(User, {
    foreignKey: 'userId'
})

User.sync()

module.exports = User
