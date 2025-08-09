import { NextRequest, NextResponse } from 'next/server';

// Helper function to mock NextRequest and NextResponse
export function mockNextRequestAndResponse(pathname: string, userId: string | null = null) {
  const mockRequest = new NextRequest(`http://localhost${pathname}`, {
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });

  // Mock the auth function for Clerk
  const mockAuth = jest.fn(() => ({ userId }));

  // Mock NextResponse.next() and NextResponse.redirect()
  const mockNextResponseNext = jest.fn(() => ({
    headers: new Headers(),
  }));
  const mockNextResponseRedirect = jest.fn((url: URL) => ({
    headers: new Headers(),
    url: url.toString(),
    status: 307,
  }));
  const mockNextResponseJson = jest.fn((data, init) => ({
    json: () => Promise.resolve(data),
    status: init?.status || 200,
  }));

  // Override the actual NextResponse methods with our mocks
  jest.spyOn(NextResponse, 'next').mockImplementation(mockNextResponseNext);
  jest.spyOn(NextResponse, 'redirect').mockImplementation(mockNextResponseRedirect);
  jest.spyOn(NextResponse, 'json').mockImplementation(mockNextResponseJson);

  return { mockRequest, mockAuth, mockNextResponseNext, mockNextResponseRedirect, mockNextResponseJson };
}