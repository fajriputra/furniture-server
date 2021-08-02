const { subject } = require("@casl/ability");
const { policyFor } = require("../policy");

const Invoice = require("./model");

module.exports = {
  showInvoice: async (req, res, next) => {
    try {
      const { order_id } = req.params;

      // data invoice berdasarkan order_id
      const invoice = await Invoice.findOne({ order: order_id })
        .populate("order") // mengambil data order terkait invoice
        .populate("user"); // mengambil data user terkait invoice

      const policy = policyFor(req.user);

      // cek berdasarkan invoice dari user
      const subjectInvoice = subject("Invoice", {
        ...invoice,
        user_id: invoice.user._id,
      });

      // tidak ada invoice
      if (!policy.can("read", subjectInvoice)) {
        return res.json({
          error: 1,
          message: `You don't have an order yet. Let's order now!`,
        });
      }

      // respon ke client
      return res.json(invoice);
    } catch (err) {
      return res.json({
        error: 1,
        message: "Error when getting Invoice",
      });
    }
  },
};
