// src/app/api/lead/route.ts — Save lead to DB (stub)

import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: implement on Day 3
  // 1. Parse request body (name, email, company)
  // 2. Save to Supabase
  // 3. Send confirmation email via Resend
  // 4. Return success

  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
