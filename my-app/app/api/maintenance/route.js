import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MaintenanceTicket from '@/models/MaintenanceTicket';

// POST /api/maintenance - Create a new maintenance ticket
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { roomNumber, issue, priority, outOfOrder } = body;

    if (!roomNumber || !issue) {
      return NextResponse.json(
        { success: false, error: 'Room number and issue description are required.' },
        { status: 400 }
      );
    }

    const newTicket = await MaintenanceTicket.create({
      roomNumber: String(roomNumber),
      issue,
      priority: priority || 'Medium',
      outOfOrder: Boolean(outOfOrder),
      status: 'Open',
    });

    return NextResponse.json(
      { success: true, message: 'Ticket logged successfully.', data: newTicket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to log maintenance ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/maintenance - Get all tickets (Useful for the admin dashboard later!)
export async function GET() {
  try {
    await connectToDatabase();
    const tickets = await MaintenanceTicket.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tickets }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}