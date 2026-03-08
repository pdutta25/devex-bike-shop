export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAllCustomers, getCustomerByEmail } from "@/lib/queries/customer-queries";
import { customerSchema } from "@/lib/validations";
import { isAdminAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Customer list is admin-only
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
