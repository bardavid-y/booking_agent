// app/api/rooms/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';

// GET /api/rooms - Get all rooms
export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Add a new room
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const newRoom = await Room.create(body);
    return NextResponse.json({ success: true, data: newRoom }, { status: 201 });
  } catch (error) {
    // Handle duplicate room number error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A room with this roomNumber already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}