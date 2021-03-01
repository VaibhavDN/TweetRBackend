const { Sequelize, DataTypes, Model } = require('sequelize')
const { Comments } = require('./Comments')

const sequelize = new Sequelize('postgres://postgres:postgres@localhost/twitter')

const Tweets = sequelize.define('Tweets', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Imma Old Boi",
    },
    loginid: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: null,
    },
    tweet: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    freezeTableName: true,
})

Tweets.hasMany(Comments, {
    foreignKey: 'postId',
    onDelete: 'cascade',
})

Comments.belongsTo(Tweets, {
    foreignKey: 'postId'
})

const TweetLike = sequelize.define('Likes', {
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    tweetId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    }
}, {
    freezeTableName: true,
})

Tweets.hasMany(TweetLike, {
    foreignKey: 'tweetId',
    onDelete: 'cascade',
})
TweetLike.belongsTo(Tweets, {
    foreignKey: 'tweetId',
})

Tweets.sync()
TweetLike.sync()

module.exports = {
    'Tweets': Tweets,
    'TweetLike': TweetLike
}