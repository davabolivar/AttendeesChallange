const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Worker } = require('../models');

exports.handleUpload = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', req.file.path);

    // Baca file Excel dan konversi langsung ke JSON
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    let skipCount = 0;
    const invalidRows = [];
    const validRows = [];

    // Lewati header (baris pertama)
    for (let i = 1; i < jsonRows.length; i++) {
      const row = jsonRows[i];

      const [nopek, nama, area, nohp, isPekerja] = row.map(cell => String(cell).trim());

      // Cek validitas kolom
      if (!nopek || !nama || !area || !nohp || !isPekerja || row.length < 5) {
        skipCount++;
        invalidRows.push({
          line: i + 1, // baris excel (1-based)
          raw: row.join(','),
          parsed: {
            nopek: nopek || null,
            nama: nama || null,
            area: area || null,
            nohp: nohp || null,
            isPekerja: isPekerja || null
          },
          reason: 'Jumlah kolom kurang atau ada nilai kosong'
        });
        continue;
      }

      validRows.push({
        nopek,
        nama,
        area,
        nohp,
        isPekerja: isPekerja.toLowerCase()
      });
    }

    // Jika semua data tidak valid
    if (validRows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: 'Semua data tidak valid atau kosong.',
        totalDiterima: 0,
        totalDilewati: skipCount,
        dataDilewati: invalidRows
      });
    }

    // Simpan data ke DB dalam chunk
    const chunkSize = 500;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      await Worker.bulkCreate(chunk);
    }

    // Hapus file sementara
    fs.unlinkSync(filePath);

    // Kirim respon sukses
    return res.status(200).json({
      message: 'Berhasil upload data pekerja',
      totalDiterima: validRows.length,
      totalDilewati: skipCount,
      dataDilewati: invalidRows
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ message: 'Upload gagal', error: err.message });
  }
};
