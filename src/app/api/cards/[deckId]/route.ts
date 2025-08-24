import { NextRequest, NextResponse } from 'next/server';

// Card features are disabled
export async function GET(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ deckId: string }> }
) {
  return NextResponse.json(
    { success: false, message: 'Card features are currently disabled' },
    { status: 503 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ deckId: string }> }
) {
  return NextResponse.json(
    { success: false, message: 'Card features are currently disabled' },
    { status: 503 }
  );
}

