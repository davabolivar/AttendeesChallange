'use strict';
module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    nopek: DataTypes.STRING,
    nama: DataTypes.STRING,
    area: DataTypes.STRING,
    nohp: DataTypes.STRING,
    isPekerja: DataTypes.STRING,
  }, {
    tableName: 'Workers',
    timestamps: false
  });
  
  Worker.associate = (models) => {
    Worker.hasMany(models.Attendance, { foreignKey: 'nopek', sourceKey: 'nopek' });
  };

  return Worker;
};
