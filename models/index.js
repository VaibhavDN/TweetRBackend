const sequelizeImport = require('sequelize')

exports.sequelize = new sequelizeImport.Sequelize('postgres://postgres:postgres@localhost/twitter'),
exports.dataType = sequelizeImport.DataTypes