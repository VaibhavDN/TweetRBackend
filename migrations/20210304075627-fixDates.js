'use strict'
const { Op } = require('sequelize');
const users = require('../models/Users')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    users.update({
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
    // What to do here!!!!
  }
}

//* npx sequelize-cli db:seed:all
