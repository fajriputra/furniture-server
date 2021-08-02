const csv = require("csvtojson");
const path = require("path");

module.exports = {
  getProvinsi: async (req, res, next) => {
    const db_provinsi = path.resolve(__dirname, "./data/provinces.csv");

    try {
      const data = await csv().fromFile(db_provinsi);

      return res.json(data);
    } catch (err) {
      return res.json({
        error: 1,
        message: "Cannot retrieve provincial data",
      });
    }
  },

  getKabupaten: async (req, res, next) => {
    const db_kabupaten = path.resolve(__dirname, "./data/regencies.csv");

    try {
      const { kode_induk } = req.query;

      const data = await csv().fromFile(db_kabupaten);

      if (!kode_induk) {
        return res.json({
          data,
          message: "The code is not available to search for regencies.",
        });
      }

      return res.json(
        data.filter((kabupaten) => kabupaten.kode_provinsi === kode_induk)
      );
    } catch (err) {
      return res.json({
        error: 1,
        message: "Unable to retrieve regencies data.",
      });
    }
  },

  getKecamatan: async (req, res, next) => {
    const db_kecamatan = path.resolve(__dirname, "./data/districts.csv");

    try {
      const { kode_induk } = req.query;

      const data = await csv().fromFile(db_kecamatan);

      if (!kode_induk) {
        return res.json({
          data,
          message: "The code is not available to search for districts",
        });
      }

      return res.json(
        data.filter((kecamatan) => kecamatan.kode_kabupaten === kode_induk)
      );
    } catch (err) {
      return res.json({
        error: 1,
        message: "Unable to retrieve district data.",
      });
    }
  },

  getDesa: async (req, res, next) => {
    const db_desa = path.resolve(__dirname, "./data/villages.csv");

    try {
      const { kode_induk } = req.query;

      const data = await csv().fromFile(db_desa);

      if (!kode_induk) {
        return res.json({
          message: "The code is not available to search for villages.",
        });
      }

      return res.json(
        data.filter((desa) => desa.kode_kecamatan === kode_induk)
      );
    } catch (err) {
      return res.json({
        error: 1,
        message: "Unable to retrieve villages data.",
      });
    }
  },
};
