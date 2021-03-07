const sequelizeImports = require('.')

const Comments = sequelizeImports.sequelize.define('Comments', {
    commentersId: {
        type: sequelizeImports.dataType.INTEGER,
        allowNull: false,
    },
    postId: {
        type: sequelizeImports.dataType.INTEGER,
        allowNull: false,
    },
    commentersName: {
        type: sequelizeImports.dataType.TEXT,
        allowNull: false,
    },
    comment: {
        type: sequelizeImports.dataType.STRING,
        allowNull: false,
    },
}, {
    freezeTableName: true,
})

Comments.sync()

module.exports = Comments
