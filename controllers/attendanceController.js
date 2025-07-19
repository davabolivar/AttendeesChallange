const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const dayjs = require('dayjs');
const { Attendance } = require('../models');

exports.handleUpload = async (req, res) => {
  const filePath = path.join(__dirname, '..', req.file.path);
  const results = [];

  try {
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({ delimiter: ',', from_line: 1, relax_quotes: true }));

    let skipCount = 0;

    for await (const record of parser) {
      if (record.length < 8) {
        skipCount++;
        continue;
      }

      const rawDate = record[6];
      const parsedDate = dayjs(rawDate, 'YYYY-MM-DD HH:mm:ss').toDate();

      if (isNaN(parsedDate.getTime())) {
        skipCount++;
        continue;
      }

      results.push({
        nama: record[0],
        instansi: record[1],
        departement: record[2],
        nohp: record[3],
        email: record[4],
        nopek: record[5],
        waktu: parsedDate,
        area: record[7]
      });
    }

    if (results.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < results.length; i += chunkSize) {
        const chunk = results.slice(i, i + chunkSize);
        await Attendance.bulkCreate(chunk);
      }
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Upload berhasil',
      totalDiterima: results.length,
      totalDilewati: skipCount
    });

  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ message: 'Upload gagal', error: err.message });
  }
};
