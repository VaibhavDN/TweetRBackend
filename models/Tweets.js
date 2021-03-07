const sequelizeImports = require('.')

const Comments = require('./Comments')

const Tweets = sequelizeImports.sequelize.define('Tweets', {
    userId: {
        type: sequelizeImports.dataType.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelizeImports.dataType.TEXT,
        allowNull: false,
        defaultValue: "Imma Old Boi",
    },
    loginid: {
        type: sequelizeImports.dataType.TEXT,
        allowNull: false,
        defaultValue: null,
    },
    tweet: {
        type: sequelizeImports.dataType.STRING,
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

Tweets.sync()

module.exports = Tweets
