const mongoose = require("mongoose");

// how our document look like
const relieveSchema = mongoose.Schema({
  student_id: { type: String },
  branch_id: { type: String, required: true },
  branch_name: { type: String },
  fee_name: { type: String },
  status: { type: String, required: true },
  fee_id: { type: String, required: true },
  amount: { type: String, required: true },
  date_relieved: { type: String },
  org_id: { type: String, required: true },
  created_date_time: { type: String },
  updated_date_time: { type: String },
});

const relieveModel = mongoose.model("relieve_amounts", relieveSchema);

module.exports = relieveModel;
