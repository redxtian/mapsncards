import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;

    if (!mapId) {
      return NextResponse.json(
        { success: false, message: 'Map ID is required' },
        { status: 400 }
      );
    }

    // Call the backend API to get the specific map
    const response = await fetch(`${API_BASE_URL}/api/maps/${mapId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Map not found' },
          { status: 404 }
        );
      }
      
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
    console.error('Error in map fetch API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;

    if (!mapId) {
      return NextResponse.json(
        { success: false, message: 'Map ID is required' },
        { status: 400 }
      );
    }

    // Call the backend API to delete the specific map
    const response = await fetch(`${API_BASE_URL}/api/maps/${mapId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Map not found' },
          { status: 404 }
        );
      }
      
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
    console.error('Error in map deletion API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}