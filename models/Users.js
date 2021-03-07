const sequelizeImports = require('.')

const Tweets = require('./Tweets')
const Like = require('./Like')

const User = sequelizeImports.sequelize.define('User', {
    name: {
        type: sequelizeImports.dataType.TEXT,
        allowNull: false,
    },
    loginid: {
        type: sequelizeImports.dataType.TEXT,
        allowNull: false,
        defaultValue: null,
    },
    password: {
        type: sequelizeImports.dataType.TEXT,
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
