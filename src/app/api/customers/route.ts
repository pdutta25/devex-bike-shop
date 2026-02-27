import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAllCustomers, getCustomerByEmail } from "@/lib/queries/customer-queries";
import { customerSchema } from "@/lib/validations";

export async function GET() {
  const result = await getAllCustomers();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Lookup by email first
  const existing = await getCustomerByEmail(body.email);
  if (existing) {
    return NextResponse.json(existing);
  }

  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = db.insert(customers).values(parsed.data).returning().get();
  return NextResponse.json(result, { status: 201 });
}
