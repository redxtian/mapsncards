import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export async function GET(_request: NextRequest) {
  try {
    const url = `${API_BASE_URL}/api/cards`;
    const response = await fetch(url, {
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
    console.error('Error in cards list API:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a generate request
    if (body.action === 'generate') {
      const response = await fetch(`${API_BASE_URL}/api/cards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: body.scenario,
          include_types: body.include_types,
          max_challenge_cards: body.max_challenge_cards
        }),
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
    }
    
    // Otherwise, it's a store request
    const response = await fetch(`${API_BASE_URL}/api/cards/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    console.error('Error in cards API:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

