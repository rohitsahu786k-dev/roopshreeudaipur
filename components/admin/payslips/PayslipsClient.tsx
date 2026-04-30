"use client";

import { useState } from "react";
import { Plus, Search, FileDown, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { generatePayslipPDF } from "@/lib/payslip-client";
import toast from "react-hot-toast";

const MOCK_PAYSLIPS = [
  {
    _id: "1",
    payslipNumber: "PS-2024-04-001",
    employeeName: "Amit Kumar",
    employeeId: "EMP001",
    designation: "Sales Executive",
    month: 4,
    year: 2024,
    basic: 25000,
    hra: 10000,
    allowances: 5000,
    bonus: 2000,
    pf: 1800,
    tax: 1200,
    otherDeductions: 500,
    totalEarnings: 42000,
    totalDeductions: 3500,
    netSalary: 38500,
    paymentDate: "2024-04-30",
    status: "paid"
  }
];

export default function PayslipsClient() {
  const [payslips] = useState(MOCK_PAYSLIPS);
  const [loading] = useState(false);

  const handleDownload = async (payslip: any) => {
    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      await generatePayslipPDF(payslip, settings);
      toast.success("Payslip generated");
    } catch (err) {
      toast.error("Failed to generate payslip");
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employee Payslips</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and generate salary slips</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90">
          <Plus size={18} /> Generate New
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Payslip #</th>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-left">Net Salary</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payslips.map((ps) => (
              <tr key={ps._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">#{ps.payslipNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{ps.employeeName}</div>
                  <div className="text-xs text-gray-500">{ps.designation}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {format(new Date(ps.year, ps.month - 1), "MMMM yyyy")}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{ps.netSalary.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 capitalize">
                    {ps.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDownload(ps)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <FileDown size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
