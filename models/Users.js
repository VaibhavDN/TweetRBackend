const { Sequelize, DataTypes } = require('sequelize')
const { CommentLike } = require('./Comments')
const { Tweets, TweetLike } = require('./Tweets')

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

User.hasMany(TweetLike, {
    foreignKey: 'userId',
    onDelete: 'cascade',
})

TweetLike.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(CommentLike, {
    foreignKey: 'userId',
    onDelete: 'cascade',
})

CommentLike.belongsTo(User, {
    foreignKey: 'userId'
})

User.sync()
TweetLike.sync()

module.exports = User
