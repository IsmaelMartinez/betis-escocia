import { NextResponse } from 'next/server';

/**
 * Legacy API endpoint for push notification subscriptions
 * This route is deprecated and only returns placeholder responses
 * since we've simplified to use browser notifications instead
 */

// GET - Always return not subscribed since we don't use complex push subscriptions
export async function GET() {
  return NextResponse.json({
    success: true,
    subscribed: false,
    supported: false,
    message: 'Using simplified browser notifications instead'
  });
}

// POST - Return success but don't actually subscribe to anything
export async function POST() {
  return NextResponse.json({
    success: true,
    subscribed: false,
    message: 'Using simplified browser notifications instead'
  });
}

// DELETE - Return success but don't actually unsubscribe from anything
export async function DELETE() {
  return NextResponse.json({
    success: true,
    subscribed: false,
    message: 'Using simplified browser notifications instead'
  });
}