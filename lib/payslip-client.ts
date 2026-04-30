"use client";

import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePayslipPDF(payslip: any, storeSettings: any) {
  const doc = new jsPDF();
  const margin = 20;
  let currentY = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(storeSettings.storeName, margin, currentY);
  
  doc.setFontSize(14);
  currentY += 10;
  doc.text("PAYSLIP FOR THE MONTH OF " + format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy").toUpperCase(), margin, currentY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  currentY += 10;
  doc.text(`Employee Name: ${payslip.employeeName}`, margin, currentY);
  doc.text(`Employee ID: ${payslip.employeeId}`, 110, currentY);
  currentY += 7;
  doc.text(`Designation: ${payslip.designation}`, margin, currentY);
  doc.text(`Payslip No: ${payslip.payslipNumber}`, 110, currentY);

  currentY += 15;
  doc.line(margin, currentY, 190, currentY);

  // Salary Table
  autoTable(doc, {
    startY: currentY + 5,
    head: [["EARNINGS", "AMOUNT", "DEDUCTIONS", "AMOUNT"]],
    body: [
      ["Basic Salary", payslip.basic, "Provident Fund (PF)", payslip.pf],
      ["HRA", payslip.hra, "Income Tax / TDS", payslip.tax],
      ["Allowances", payslip.allowances, "Other Deductions", payslip.otherDeductions],
      ["Bonus", payslip.bonus, "", ""],
      [{ content: "TOTAL EARNINGS", styles: { fontStyle: "bold" } }, payslip.totalEarnings, { content: "TOTAL DEDUCTIONS", styles: { fontStyle: "bold" } }, payslip.totalDeductions]
    ],
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50] },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Net Salary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NET SALARY: INR " + payslip.netSalary.toLocaleString(), margin, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  currentY += 10;
  doc.text(`Payment Date: ${payslip.paymentDate ? format(new Date(payslip.paymentDate), "dd-MM-yyyy") : "N/A"}`, margin, currentY);
  doc.text(`Status: ${payslip.status.toUpperCase()}`, 110, currentY);

  currentY += 30;
  doc.line(margin, currentY, 80, currentY);
  doc.line(130, currentY, 190, currentY);
  doc.text("Employer Signature", margin + 10, currentY + 5);
  doc.text("Employee Signature", 140, currentY + 5);

  doc.save(`Payslip-${payslip.employeeName}-${payslip.month}-${payslip.year}.pdf`);
}
