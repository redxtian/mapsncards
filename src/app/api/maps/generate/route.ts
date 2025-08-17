import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      scenario, 
      engine = 'crewai',
      quickGeneration = false,
      customScenario = false,
      category,
      industry,
      stakesLevel
    } = body;

    if (!scenario) {
      return NextResponse.json(
        { success: false, message: 'Scenario is required' },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/api/generate-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        engine,
        quickGeneration,
        customScenario,
        category,
        industry,
        stakesLevel
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
    
    // Return the result from the backend
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in map generation API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}