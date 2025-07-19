'use strict';
module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    nama: DataTypes.STRING,
    instansi: DataTypes.STRING,
    departement: DataTypes.STRING,
    nohp: DataTypes.STRING,
    email: DataTypes.STRING,
    nopek: DataTypes.STRING,
    waktu: DataTypes.DATE,
    area: DataTypes.STRING
  }, {
    tableName: 'Attendance',
    timestamps: false // 👈 MATIKAN createdAt dan updatedAt

  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Worker, { foreignKey: 'nopek', targetKey: 'nopek' });
  };

  return Attendance;
};
