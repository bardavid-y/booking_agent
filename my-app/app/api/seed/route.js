// app/api/seed/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing rooms to avoid duplicates if you run this multiple times
    await Room.deleteMany({});

    const initialRooms = [
      { roomNumber: '101', roomType: 'Standard', capacity: 2, pricePerNight: 100, status: 'Available' },
      { roomNumber: '102', roomType: 'Standard', capacity: 2, pricePerNight: 100, status: 'Available' },
      { roomNumber: '103', roomType: 'Standard', capacity: 2, pricePerNight: 100, status: 'Available' },
      { roomNumber: '104', roomType: 'Standard', capacity: 2, pricePerNight: 100, status: 'Available' },
      { roomNumber: '201', roomType: 'Deluxe', capacity: 3, pricePerNight: 150, status: 'Available' },
      { roomNumber: '202', roomType: 'Deluxe', capacity: 3, pricePerNight: 150, status: 'Available' },
      { roomNumber: '203', roomType: 'Deluxe', capacity: 3, pricePerNight: 150, status: 'Available' },
      { roomNumber: '301', roomType: 'Suite', capacity: 4, pricePerNight: 250, status: 'Available' },
      { roomNumber: '302', roomType: 'Suite', capacity: 4, pricePerNight: 250, status: 'Available' },
      { roomNumber: '303', roomType: 'Suite', capacity: 4, pricePerNight: 250, status: 'Available' },
    ];

    const createdRooms = await Room.insertMany(initialRooms);

    return NextResponse.json(
      { success: true, message: '10 rooms created successfully!', data: createdRooms },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}