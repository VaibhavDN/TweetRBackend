const sequelizeImports = require('.')

const Images = sequelizeImports.sequelize.define('Images', {
    image: {
        type: sequelizeImports.dataType.BLOB,
        allowNull: false,
    }
}, {
    freezeTableName: true,
})

Images.sync()

module.exports = {
    Images,
}
