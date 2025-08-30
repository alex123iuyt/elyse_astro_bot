import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    
    if (role === 'admin' || role === 'user') {
      cookies().set('elyse.role', role, { 
        path: '/', 
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false // Allow client-side access
      });
      
      return NextResponse.json({ success: true, role });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid role' 
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}


