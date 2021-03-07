const sequelizeImports = require(".")

const Comments = require("./Comments")
const Tweets = require("./Tweets")

const Like = sequelizeImports.sequelize.define('Likes', {
    id: {
        type: sequelizeImports.dataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    userId: {
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    postId: {
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    postType: {
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    likeType: {
        type: sequelizeImports.dataType.BIGINT,
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

module.exports = Like
