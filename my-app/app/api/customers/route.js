// app/api/customers/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    await connectToDatabase();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: customers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/customers - Add a new customer
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const newCustomer = await Customer.create(body);
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A customer with this email already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}