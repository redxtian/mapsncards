import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    if (!deckId) {
      return NextResponse.json({ success: false, message: 'Deck ID is required' }, { status: 400 });
    }
    const response = await fetch(`${API_BASE_URL}/api/cards/${deckId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in card fetch API:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    if (!deckId) {
      return NextResponse.json({ success: false, message: 'Deck ID is required' }, { status: 400 });
    }
    const response = await fetch(`${API_BASE_URL}/api/cards/${deckId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in card delete API:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

