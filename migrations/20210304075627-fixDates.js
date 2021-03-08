'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'User',
      'createdAt',
      {
        type: Sequelize.DataTypes.NOW,
        defaultValue: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    )

    queryInterface.addColumn(
      'User',
      'updatedAt',
      {
        type: Sequelize.DataTypes.NOW,
        defaultValue: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    )
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'User',
      'createdAt',
    )

    queryInterface.removeColumn(
      'User',
      'updatedAt',
    )
  }
}

//* npx sequelize-cli db:migrate
//* npx sequelize-cli db:seed:all
