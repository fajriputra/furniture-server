const { subject } = require("@casl/ability");
const { policyFor } = require("../policy");

const Invoice = require("./model");

module.exports = {
  showInvoice: async (req, res, next) => {
    try {
      // dapatkan route params dari order_id
      let { order_id } = req.params;

      // dapatkan data invoice berdasarkan order_id
      let invoice = await Invoice.findOne({ order: order_id })
        .populate("order")
        .populate("user");

      // (1) deklarasikan `policy` untuk `user`
      let policy = policyFor(req.user);

      // (2) buat `subjectInvoice`
      let subjectInvoice = subject("Invoice", {
        ...invoice,
        user_id: invoice.user._id,
      });

      // (3) cek policy `read` menggunakan `subjectInvoice`
      if (!policy.can("read", subjectInvoice)) {
        return res.json({
          error: 1,
          message: `You don't have an order yet. Let's order now!`,
        });
      }

      // (1) respon ke _client_
      return res.json(invoice);
    } catch (err) {
      return res.json({
        error: 1,
        message: "Error when getting Invoice",
      });
    }
  },
};
