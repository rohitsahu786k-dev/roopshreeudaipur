import mongoose, { type InferSchemaType, type Model } from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    payslipNumber: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    designation: { type: String, required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    
    // Earnings
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    
    // Deductions
    pf: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    
    totalEarnings: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    
    paymentDate: Date,
    status: { type: String, enum: ["draft", "paid", "cancelled"], default: "draft" },
    pdfUrl: String
  },
  { timestamps: true }
);

payslipSchema.index({ payslipNumber: 1 });
payslipSchema.index({ employee: 1, month: 1, year: 1 });

export type PayslipDocument = InferSchemaType<typeof payslipSchema>;

export const Payslip: Model<PayslipDocument> =
  mongoose.models.Payslip || mongoose.model<PayslipDocument>("Payslip", payslipSchema);
