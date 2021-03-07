const sequelizeImports = require('.')

const User = require('./Users')

const Relationships = sequelizeImports.sequelize.define('Relationships', {
    userOneId: {
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    userTwoId: {
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    status: { /* 0 Pending 1 Accepted 2 Declined 3 Blocked */
        type: sequelizeImports.dataType.BIGINT,
        allowNull: false,
    },
    actionUserId: { // Id of the user who most recently initiated the status change action
        type: sequelizeImports.dataType.BIGINT,
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
