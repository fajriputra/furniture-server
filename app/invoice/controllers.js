const { subject } = require("@casl/ability");
const { policyFor } = require("../policy");
const { Snap } = require("midtrans-client");
const { midtrans } = require("../config");

const Invoice = require("./model");

const snap = new Snap({
  isProduction: midtrans.isProduction,
  clientKey: midtrans.clientKey,
  serverKey: midtrans.serverKey,
});

module.exports = {
  initiatePayment: async (req, res, next) => {
    try {
      const { order_id } = req.params;

      // cari invoice berdasarkan order_id
      const invoice = await Invoice.findOne({ order: order_id })
        .populate("order") // mengambil data order terkait pembayaran
        .populate("user"); // mengambil data user terkait pembayaran

      // tidak ada invoice
      if (!invoice) {
        return res.json({
          error: 1,
          message: "Invoice not found",
        });
      }

      // informasi terkait order / invoice user
      const parameter = {
        transaction_details: {
          order_id: invoice.order_id,
          gross_amount: invoice.total,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: invoice.user.name,
          email: invoice.user.email,
        },
      };

      // kirim informasi invoice / order yang ingin dibayar ke midtrans
      const response = await snap.createTransaction(parameter);

      // response ke client
      return res.json(response);
    } catch (err) {
      return res.json({
        error: 1,
        message: "Something when wrong",
      });
    }
  },

  showInvoice: async (req, res, next) => {
    try {
      const { order_id } = req.params;

      // cari invoice berdasarkan order_id
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
