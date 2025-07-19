const { Op } = require('sequelize');
const Attendance = require('../models').Attendance;
const Worker = require('../models').Worker;
const moment = require('moment');

exports.getAttendanceRekap = async (req, res) => {
  try {
    const now = moment();
    const startDate = req.query.startDate
      ? moment(req.query.startDate).startOf('day')
      : now.clone().startOf('month');

    const endDate = req.query.endDate
      ? moment(req.query.endDate).endOf('day')
      : now.clone().endOf('month');

    const dateRange = [];
    let current = startDate.clone();
    while (current.isSameOrBefore(endDate)) {
      dateRange.push(current.format('YYYY-MM-DD'));
      current.add(1, 'days');
    }

    // Ambil query filter
    const tipe = req.query.tipe || 'Semua'; // 'Pekerja', 'Non-Pekerja', 'Semua'
    const area = req.query.area || 'Semua';

    const workerWhere = {};

    if (tipe === 'Pekerja') {
      workerWhere.isPekerja = 'y';
    } else if (tipe === 'Non-Pekerja') {
      workerWhere.isPekerja = '0';
    }

    if (area !== 'Semua') {
      workerWhere.area = area;
    }

    const workers = await Worker.findAll({
      where: workerWhere,
    });

    const attendances = await Attendance.findAll({
      where: {
        waktu: {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        },
      },
    });

    const attendanceMap = {};
    attendances.forEach(log => {
      const dateKey = moment(log.waktu).format('YYYY-MM-DD');
      const key = `${log.nopek}_${dateKey}`;
      if (!attendanceMap[key]) attendanceMap[key] = [];
      attendanceMap[key].push(new Date(log.waktu));
    });

    const response = [];

    for (const worker of workers) {
      const row = {
        nopek: worker.nopek,
        nama: worker.nama,
        area: worker.area,
        isPekerja: worker.isPekerja,
        data: {},
        terlambat: 0,
        pulangCepat: 0,
        tidakCheckout: 0,
      };

      for (const date of dateRange) {
        const key = `${worker.nopek}_${date}`;
        const waktuArray = attendanceMap[key];
        const isHoliday = moment(date).isoWeekday() >= 6 ? 1 : 0;

        if (waktuArray && waktuArray.length > 0) {
          waktuArray.sort((a, b) => a - b);
          const masuk = moment(waktuArray[0]).format('HH:mm:ss');
          const keluar =
            waktuArray.length > 1
              ? moment(waktuArray[waktuArray.length - 1]).format('HH:mm:ss')
              : '---';

          const uniqueTimes = [...new Set(waktuArray.map(w => moment(w).format('HH:mm:ss')))];
          if (uniqueTimes.length === 1) {
            row.tidakCheckout += 1;
          }

          if (masuk > '07:30:00') row.terlambat += 1;

          if (keluar !== '---') {
            const start = moment(`${date} ${masuk}`, 'YYYY-MM-DD HH:mm:ss');
            const end = moment(`${date} ${keluar}`, 'YYYY-MM-DD HH:mm:ss');
            const durationInHours = end.diff(start, 'minutes') / 60;
            if (durationInHours < 8) {
              row.pulangCepat += 1;
            }
          }

          row.data[date] = {
            masuk,
            keluar,
            isHoliday,
            isAbsent: 0,
          };

        } else {
          row.data[date] = {
            masuk: '---',
            keluar: '---',
            isHoliday,
          };

          if (!isHoliday) {
            row.data[date].isAbsent = 1;
          }
        }
      }

      response.push(row);
    }

    res.json(response);
  } catch (error) {
    console.error('[ERROR getAttendanceRekap]', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil rekap absensi',
      error: error.message,
    });
  }
};
