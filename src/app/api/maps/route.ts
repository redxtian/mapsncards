import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export async function GET(_request: NextRequest) {
  try {
    // Call the backend API to get all maps
    const response = await fetch(`${API_BASE_URL}/api/maps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    // Return the result from the backend
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in maps fetch API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}