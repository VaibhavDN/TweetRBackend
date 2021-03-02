const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize('postgres://postgres:postgres@localhost/twitter')

const Comments = sequelize.define('Comments', {
    commentersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    commentersName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    freezeTableName: true,
})

Comments.sync()

module.exports = {
    'Comments': Comments,
}
