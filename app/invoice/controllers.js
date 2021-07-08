const { subject } = require("@casl/ability");
const { policyFor } = require("../policy");

const Invoice = require("./model");

module.exports = {
  showInvoice: async (req, res, next) => {
    try {
      let { order_id } = req.params;

      let invoice = await Invoice.findOne({ order: order_id })
        .populate("order")
        .populate("user");

      let policy = policyFor(req.user);

      let subjectInvoice = subject("Invoice", {
        ...invoice,
        user_id: invoice.user._id,
      });

      if (!policy.can("read", subjectInvoice)) {
        return res.json({
          error: 1,
          message: `You don't have an order yet. Let's order now!`,
        });
      }

      return res.json(invoice);
    } catch (err) {
      return res.json({
        error: 1,
        message: "Error when getting Invoice",
      });
    }
  },
};
