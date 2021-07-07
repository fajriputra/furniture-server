const fs = require("fs");
const path = require("path");
const config = require("../config");

// (1) import model product, category
const Product = require("./model");
const Category = require("../categories/model");
const Tag = require("../tags/model");
const policyFor = require("../policy");

module.exports = {
  createProduct: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("create", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      // (1) tangkap data form yang dikirimkan oleh client sebagai variable "payload"
      const payload = req.body;

      if (payload.category) {
        // mencari data ke collection categories berdasarkan nama
        const category = await Category.findOne({
          name: { $regex: payload.category, $options: "i" },
        });
        // jika category ditemukan dalam collection, kita ambil _id dan gabungkan dengan payload
        if (category) {
          payload = { ...payload, category: category._id };
        } else {
          // jika tidak, kita hapus category dari payload
          delete payload.category;
        }
      }

      if (payload.tags && payload.tags.length) {
        // mencari data ke collection tag berdasarkan nama
        const tags = await Tag.find({ name: { $in: payload.tags } });
        // mengecek tags ada atau tidak,
        if (tags.length) {
          // jika ada kita ambil _id untuk masing2 Tag & gabungkan dengan payload
          payload = { ...payload, tags: tags.map((tag) => tag._id) };
        }
      }

      if (req.file) {
        // mengecek apakah product mengandung file/tidak, jika iya, akan memproses yang ada didalam block "if", jika tidak mengandung file/tanpa image, akan memproses yang ada didalam block "else"
        // direktori sementara file yang diupload
        const tmp_path = req.file.path;
        // tangkap extensi file yang diupload
        const originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        // req.file.originalname merupakan nama asli file sementara, req.file.filename merupakan nama random yang digenerate oleh multer

        // membuat nama file lengkap serta extensi yang baru diupload
        const filename = req.file.filename + "." + originalExt;

        // konfigurasi tempat penyimpanan file yang diupload
        const target_path = path.resolve(
          config.rootPath,
          `public/images/${filename}`
        );

        // membaca file yang masih di direktori sementara
        const src = fs.createReadStream(tmp_path);
        // memindahkan file ke direktori permanen
        const dest = fs.createWriteStream(target_path);
        // memulai memindahkan dari direktori sementara ke direktori permanen
        src.pipe(dest);

        // deteksi pemindahan selesai
        src.on("end", async () => {
          try {
            // (2) membuat produk baru disertai dengan data nama file gambar yang diupload
            let product = new Product({ ...payload, image_url: filename });

            // (3) save product ke MongoDB
            await product.save();

            // (4) send response ke client dan mengembalikan product yang telah dibuat
            return res.json({
              message: "Product successfully created.",
              data: product,
            });
          } catch (err) {
            //   jika error, hapus file yang sudah terupload pada directori
            fs.unlinkSync(target_path);

            // cek tipe error
            if (err && err.name === "ValidationError") {
              return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
              });
            }
            next(err);
          }
        });

        src.on("error", async () => {
          next(err);
        });
      } else {
        // membuat produk baru tanpa image
        let product = new Product(payload);
        // menyimpan produk ke MongoDB
        await product.save();
        // send response ke client dan mengembalikan product yang telah dibuat (tanpa image)
        return res.json({
          message: "Product successfully created.",
          data: product,
        });
      }
    } catch (err) {
      // cek tipe error
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
  listProduct: async (req, res, next) => {
    try {
      const {
        limit = 10,
        skip = 0,
        q = "",
        category = "",
        tags = [],
      } = req.query;

      let criteria = {};

      // mengecek apakah q memiliki nilai atau tidak
      if (q.length) {
        // gabungkan dengan criteria
        criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
      }

      // mengecek apakah category memiliki nilai atau tidak
      if (category.length) {
        category = await Category.findOne({
          name: { $regex: `${category}` },
          $options: "i",
        });

        if (category) {
          criteria = { ...criteria, category: category._id };
        }
      }

      // mengecek apakah tags memiliki nilai atau tidak
      if (tags.length) {
        tags = await Tag.find({ name: { $in: tags } });

        criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
      }

      let count = await Product.find(criteria).countDocuments();

      // melakukan pagination & mengambil semua data produk dari MongoDB
      const products = await Product.find(criteria)
        .limit(parseInt(limit)) // mengubah tipe data string to integer
        .skip(parseInt(skip))
        .populate("category")
        .populate("tags")
        .select("-__v");

      // send response ke client dan mengembalikan product yang telah di dapat
      return res.json({ data: products, count });
    } catch (err) {
      next(err);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("update", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      // (1) tangkap data form yang dikirimkan oleh client sebagai variable "payload"
      const payload = req.body;

      if (payload.category) {
        const category = await Category.findOne({
          name: { $regex: payload.category, $options: "i" },
        });

        if (category) {
          payload = { ...payload, category: category._id };
        } else {
          delete payload.category;
        }
      }

      if (payload.tags && payload.tags.length) {
        const tags = await Tag.find({ name: { $in: payload.tags } });

        if (tags.length) {
          payload = { ...payload, tags: tags.map((tag) => tag._id) };
        }
      }

      // mengecek apakah product mengandung file/tidak, jika iya, akan memproses yang ada didalam block "if", jika tidak mengandung file/tanpa image, akan memproses yang ada didalam block "else"
      if (req.file) {
        // direktori sementara file yang diupload
        const tmp_path = req.file.path;
        // tangkap extensi file yang diupload
        const originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        // req.file.originalname merupakan nama asli file sementara, req.file.filename merupakan nama random yang digenerate oleh multer

        // membuat nama file lengkap serta extensi yang baru diupload
        const filename = req.file.filename + "." + originalExt;

        // konfigurasi tempat penyimpanan file yang diupload
        const target_path = path.resolve(
          config.rootPath,
          `public/images/${filename}`
        );

        // membaca file yang masih di direktori sementara
        const src = fs.createReadStream(tmp_path);
        // memindahkan file ke direktori permanen
        const dest = fs.createWriteStream(target_path);
        // memulai memindahkan dari direktori sementara ke direktori permanen
        src.pipe(dest);

        // deteksi pemindahan selesai
        src.on("end", async () => {
          try {
            let product = await Product.findOne({ _id: req.params.id });

            // dapatkan path lengkap tempat penyimpanan image berdasarkan "product.image_url"
            let currentImage = `${config.rootPath}/public/images/${product.image_url}`;

            // cek apakah file benar-benar ada pada file system
            if (fs.existsSync(currentImage)) {
              // hapus jika ada
              fs.unlinkSync(currentImage);
            }

            // mencari & mengupdate data produk berdasarkan id menggunakan req.params.id
            product = await Product.findOneAndUpdate(
              { _id: req.params.id },
              { ...payload, image_url: filename },
              { new: true, runValidators: true }
            );
            // findOneAndUpdate merupakan data terbaru yang ingin digunakan untuk mengupdate yang didapatkan dari req.body / yang dikirim oleh client (payload)
            // new merupakan instruksi pada MongoDB agar mengembalikan data terbaru yang sudah diupdate, sedangkan
            // runValidators meminta agar Mongoose menjalankan validation pada operasi ini, karna defaultnya tidak dijalankan pada operasi findOneAndUpdate

            // send response ke client dan mengembalikan product yang telah diupdate
            return res.json({
              message: "Product successfully updated.",
              data: product,
            });
          } catch (err) {
            // cek tipe error
            if (err && err.name === "ValidationError") {
              return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
              });
            }
            next(err);
          }
        });

        src.on("error", async () => {
          next(err);
        });
      } else {
        // update produk jika tidak ada file upload
        let product = await Product.findOneAndUpdate(
          { _id: req.params.id },
          payload,
          { new: true, runValidators: true }
        );

        // send response ke client dan mengembalikan product yang telah diupdate
        return res.json({
          message: "Product successfully updated.",
          data: product,
        });
      }
    } catch (err) {
      // cek tipe error
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("delete", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      let product = await Product.findOneAndDelete({ _id: req.params.id });

      // dapatkan path lengkap tempat penyimpanan image berdasarkan "product.image_url"
      let currentImage = `${config.rootPath}/public/images/${product.image_url}`;

      // cek apakah file benar-benar ada pada file system
      if (fs.existsSync(currentImage)) {
        // hapus jika ada
        fs.unlinkSync(currentImage);
      }

      // mengembalikan product yang telah dihapus ke client
      return res.json({
        message: "Product successfully deleted.",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },
};
