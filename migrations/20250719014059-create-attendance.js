'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Attendance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      instansi: {
        type: Sequelize.STRING
      },
      departement: {
        type: Sequelize.STRING
      },
      nohp: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      nopek: {
        type: Sequelize.STRING
      },
      waktu: {
        type: Sequelize.DATE,
        allowNull: false
      },
      area: {
        type: Sequelize.STRING
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Attendance');
  }
};
