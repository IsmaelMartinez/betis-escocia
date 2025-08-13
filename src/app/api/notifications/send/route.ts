import { NextResponse } from 'next/server';

/**
 * Legacy API endpoint for sending push notifications
 * This route is deprecated since we've simplified to use browser notifications
 * that are triggered directly from the admin dashboard
 */

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Using simplified browser notifications instead',
    recipients: 0,
    total: 0
  });
}