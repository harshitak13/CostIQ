// src/app/api/audit/route.ts — Create audit, return UUID (stub)

import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: implement on Day 2
  // 1. Parse request body (ToolInput[])
  // 2. Run audit engine
  // 3. Store result in Supabase
  // 4. Return UUID

  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
