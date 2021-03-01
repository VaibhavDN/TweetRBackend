const { Sequelize, DataTypes } = require('sequelize')
const User = require('./Users')

const sequelize = new Sequelize('postgres://postgres:postgres@localhost/twitter')

const Relationships = sequelize.define('Relationships', {
    userOneId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    userTwoId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    status: { /* 0 Pending 1 Accepted 2 Declined 3 Blocked */
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    actionUserId: { // Id of the user who most recently initiated the status change action
        type: DataTypes.BIGINT,
        allowNull: false,
    }
}, {
    freezeTableName: true,
})

User.hasMany(Relationships, {
    foreignKey: 'userOneId',
    onDelete: 'cascade',
})

Relationships.belongsTo(User, {
    foreignKey: 'userOneId',
})

Relationships.sync()

module.exports = Relationships
