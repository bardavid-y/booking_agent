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

// PATCH /api/rooms - Update room status
export async function PATCH(request) {
  try {
    await connectToDatabase();
    const { roomNumber, status } = await request.json();

    if (!roomNumber || !status) {
      return NextResponse.json(
        { success: false, error: "roomNumber and status are required." },
        { status: 400 }
      );
    }

    // Find the room and update its status
    const result = await Room.updateOne(
      { roomNumber: String(roomNumber) },
      { status: status } 
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Room not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: `Room status updated to ${status}.` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}