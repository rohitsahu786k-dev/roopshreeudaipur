import { NextResponse, type NextRequest } from "next/server";
import { normalizeAddress, requireAccountUser, validateAddress } from "@/lib/account";

type Context = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Context) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const next = normalizeAddress(await request.json());
  const error = validateAddress(next);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const address = result.user.addresses.id(params.id);
  if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  if (next.isDefault || next.isDefaultShipping || next.isDefaultBilling) {
    result.user.addresses.forEach((entry) => {
      if (next.isDefault) entry.isDefault = false;
      if (next.isDefaultShipping) entry.isDefaultShipping = false;
      if (next.isDefaultBilling) entry.isDefaultBilling = false;
    });
  }

  address.set(next);
  await result.user.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const result = await requireAccountUser();
  if (result.error) return result.error;

  const address = result.user.addresses.id(params.id);
  if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  address.deleteOne();
  await result.user.save();
  return NextResponse.json({ ok: true });
}
