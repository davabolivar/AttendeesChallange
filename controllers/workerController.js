const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Worker } = require('../models');

exports.handleUpload = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvString = XLSX.utils.sheet_to_csv(sheet);
    const lines = csvString.trim().split('\n');

    let skipCount = 0;
    const rows = lines.map((line, index) => {
      const columns = line
        .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        ?.map(col => col.replace(/^"|"$/g, '').trim());

      if (!columns || columns.length < 5) return null;

      return {
        nopek: columns[0],
        nama: columns[1],
        area: columns[2],
        nohp: columns[3],
        isPekerja: columns[4]
      };
    }).filter(row => {
      if (row === null) {
        skipCount++;
        return false;
      }
      return true;
    });


    if (rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Semua data tidak valid atau kosong.' });
    }

    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await Worker.bulkCreate(chunk);
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Berhasil upload data pekerja',
      totalDiterima: rows.length,
      totalDilewati: skipCount
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ message: 'Upload gagal', error: err.message });
  }
};
