const { Sequelize, DataTypes } = require("sequelize")
const { Comments } = require("./Comments")
const { Tweets } = require("./Tweets")

const sequelize = new Sequelize('postgres://postgres:postgres@localhost/twitter')

const Like = sequelize.define('Likes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    postId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    postType: { // 0 tweet 1 comment
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    likeType: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    freezeTableName: true,
})

Tweets.hasMany(Like, {
    foreignKey: 'postId',
    onDelete: 'cascade',
})
Like.belongsTo(Tweets, {
    foreignKey: 'postId',
})

Comments.hasMany(Like, {
    foreignKey: 'postId',
    onDelete: 'cascade',
})
Like.belongsTo(Comments, {
    foreignKey: 'postId',
})

Like.sync()

module.exports = {
    'Like': Like,
}
