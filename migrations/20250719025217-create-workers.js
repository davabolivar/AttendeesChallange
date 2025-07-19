'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Workers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nopek: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      nohp: {
        type: Sequelize.STRING
      },
      isPekerja: {
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Workers');
  }
};
