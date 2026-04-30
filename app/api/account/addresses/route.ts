import { NextResponse, type NextRequest } from "next/server";
import { normalizeAddress, requireAccountUser, validateAddress } from "@/lib/account";

function serializeAddresses(user: any) {
  return (user?.addresses ?? []).map((address: any) => ({
    id: String(address._id),
    label: address.label,
    type: address.type,
    full_name: address.fullName,
    phone: address.phone,
    address_line1: address.line1,
    address_line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    country: address.country,
    postal_code: address.postalCode ?? address.pincode,
    landmark: address.landmark ?? "",
    is_default: address.isDefault,
    isDefaultShipping: address.isDefaultShipping,
    isDefaultBilling: address.isDefaultBilling
  }));
}

export async function GET() {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  return NextResponse.json({ addresses: serializeAddresses(result.user) });
}

export async function POST(request: NextRequest) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const address = normalizeAddress(await request.json());
  const error = validateAddress(address);
  if (error) return NextResponse.json({ error }, { status: 400 });

  if (address.isDefault || address.isDefaultShipping || address.isDefaultBilling) {
    result.user.addresses.forEach((entry) => {
      if (address.isDefault) entry.isDefault = false;
      if (address.isDefaultShipping) entry.isDefaultShipping = false;
      if (address.isDefaultBilling) entry.isDefaultBilling = false;
    });
  }

  result.user.addresses.push(address);
  await result.user.save();
  return NextResponse.json({ addresses: serializeAddresses(result.user) }, { status: 201 });
}
