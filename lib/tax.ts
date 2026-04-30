export type TaxBreakdown = {
  cgst: number;
  sgst: number;
  igst: number;
  vat: number;
  totalTax: number;
  taxType: "GST" | "IGST" | "VAT" | "OTHER";
};

export function calculateTax(
  amount: number,
  shippingState: string,
  shippingCountry: string,
  businessState: string = "Rajasthan", // Default business state
  businessCountry: string = "India"
): TaxBreakdown {
  const isIndia = shippingCountry.toLowerCase() === "india";
  const isSameState = shippingState.toLowerCase() === businessState.toLowerCase();

  if (isIndia) {
    if (isSameState) {
      // CGST + SGST (9% each assuming 18% total GST included in price)
      // Since prices are inclusive, we extract tax: Base = Amount / (1 + TaxRate)
      const totalTax = amount - (amount / 1.18);
      const half = totalTax / 2;
      return {
        cgst: half,
        sgst: half,
        igst: 0,
        vat: 0,
        totalTax,
        taxType: "GST"
      };
    } else {
      // IGST (18%)
      const totalTax = amount - (amount / 1.18);
      return {
        cgst: 0,
        sgst: 0,
        igst: totalTax,
        vat: 0,
        totalTax,
        taxType: "IGST"
      };
    }
  } else {
    // International Tax (VAT or Other) - Assuming 5% for example or configurable
    const totalTax = amount - (amount / 1.05);
    return {
      cgst: 0,
      sgst: 0,
      igst: 0,
      vat: totalTax,
      totalTax,
      taxType: "VAT"
    };
  }
}
