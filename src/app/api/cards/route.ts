import { NextRequest, NextResponse } from 'next/server';

// Card generation features are disabled
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'Card features are currently disabled' },
    { status: 503 }
  );
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'Card generation features are currently disabled' },
    { status: 503 }
  );
}

