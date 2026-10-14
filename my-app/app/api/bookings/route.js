// app/api/bookings/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import Customer from '@/models/Customer';

// GET /api/bookings - Get all bookings with room and customer details
export async function GET() {
  try {
    await connectToDatabase();
    
    // Ensure models are registered for population
    const bookings = await Booking.find({})
      .populate('room', 'roomNumber roomType pricePerNight')
      .populate('customer', 'fullName email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { room, customer, checkInDate, checkOutDate, totalAmount } = body;

    if (!room || !customer || !checkInDate || !checkOutDate || totalAmount == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    // Check if the room exists
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return NextResponse.json(
        { success: false, error: 'Room not found.' },
        { status: 404 }
      );
    }

    // Check if the customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return NextResponse.json(
        { success: false, error: 'Customer not found.' },
        { status: 404 }
      );
    }

    // Optional: Update room status to Occupied
    roomDoc.status = 'Occupied';
    await roomDoc.save();

    const newBooking = await Booking.create({
      room,
      customer,
      checkInDate,
      checkOutDate,
      totalAmount,
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}