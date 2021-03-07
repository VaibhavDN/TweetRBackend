'use strict'
const Op = require('sequelize').Op

const Users = require('../models/Users')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Users.update({
      createdAt: Sequelize.DataTypes.NOW,
      updatedAt: Sequelize.DataTypes.NOW,
    }, {
      where: {
        [Op.or]: [
          {
            createdAt: {
              [Op.is]: null,
            },
          },
          {
            updatedAt: {
              [Op.is]: null,
            },
          }
        ]
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Nothing to do here!!!!
  }
}

//* npx sequelize-cli db:migrate
//* npx sequelize-cli db:seed:all
