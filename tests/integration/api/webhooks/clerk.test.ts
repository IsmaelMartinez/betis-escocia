// Mock external dependencies first
jest.mock('svix', () => ({
  Webhook: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn((input, init) => {
    const request = new Request(input, init);
    return {
      ...request,
      json: jest.fn(() => request.json()),
      url: request.url,
    };
  }),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

jest.mock('@/lib/supabase', () => ({
  linkExistingSubmissionsToUser: jest.fn(),
  unlinkUserSubmissions: jest.fn(),
}));

import { POST } from '@/app/api/webhooks/clerk/route';
import { linkExistingSubmissionsToUser, unlinkUserSubmissions } from '@/lib/supabase';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

const mockLinkExistingSubmissionsToUser = linkExistingSubmissionsToUser as jest.Mock;
const mockUnlinkUserSubmissions = unlinkUserSubmissions as jest.Mock;
const mockHeaders = headers as jest.Mock;
const MockWebhook = Webhook as jest.MockedClass<typeof Webhook>;

describe('Clerk Webhook API', () => {
  let mockVerify: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'test-webhook-secret';
    
    // Mock svix Webhook instance
    mockVerify = jest.fn();
    MockWebhook.mockImplementation(() => ({
      verify: mockVerify,
    } as unknown as typeof MockWebhook.prototype));
    
    // Default successful header mock
    mockHeaders.mockResolvedValue(new Map([
      ['svix-id', 'test-id'],
      ['svix-timestamp', '1234567890'],
      ['svix-signature', 'test-signature'],
    ]));
    
    // Default successful supabase function mocks
    mockLinkExistingSubmissionsToUser.mockResolvedValue({
      rsvpLinked: 2,
      contactLinked: 1,
      errors: []
    });
    
    mockUnlinkUserSubmissions.mockResolvedValue({
      rsvpUnlinked: 1,
      contactUnlinked: 1,
      errors: []
    });
  });

  afterEach(() => {
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  describe('user.created event', () => {
    it('should successfully process user.created webhook and link submissions', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'user_test123',
          email_addresses: [
            { email_address: 'test@example.com' }
          ]
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockLinkExistingSubmissionsToUser).toHaveBeenCalledWith(
        'user_test123',
        'test@example.com'
      );
      expect(mockUnlinkUserSubmissions).not.toHaveBeenCalled();
    });
  });

  describe('user.updated event', () => {
    it('should successfully process user.updated webhook and link submissions', async () => {
      const webhookData = {
        type: 'user.updated',
        data: {
          id: 'user_test456',
          email_addresses: [
            { email_address: 'updated@example.com' }
          ]
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockLinkExistingSubmissionsToUser).toHaveBeenCalledWith(
        'user_test456',
        'updated@example.com'
      );
      expect(mockUnlinkUserSubmissions).not.toHaveBeenCalled();
    });

    it('should handle user.updated event with no email address', async () => {
      const webhookData = {
        type: 'user.updated',
        data: {
          id: 'user_test789',
          email_addresses: []
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockLinkExistingSubmissionsToUser).not.toHaveBeenCalled();
      expect(mockUnlinkUserSubmissions).not.toHaveBeenCalled();
    });
  });

  describe('user.deleted event', () => {
    it('should successfully process user.deleted webhook and unlink submissions', async () => {
      const webhookData = {
        type: 'user.deleted',
        data: {
          id: 'user_deleted123'
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUnlinkUserSubmissions).toHaveBeenCalledWith('user_deleted123');
      expect(mockLinkExistingSubmissionsToUser).not.toHaveBeenCalled();
    });

    it('should handle user.deleted event with missing user ID', async () => {
      const webhookData = {
        type: 'user.deleted',
        data: {}
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUnlinkUserSubmissions).not.toHaveBeenCalled();
      expect(mockLinkExistingSubmissionsToUser).not.toHaveBeenCalled();
    });
  });

  describe('unhandled event types', () => {
    it('should handle unknown event types gracefully', async () => {
      const webhookData = {
        type: 'session.created',
        data: {
          id: 'session_123'
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockLinkExistingSubmissionsToUser).not.toHaveBeenCalled();
      expect(mockUnlinkUserSubmissions).not.toHaveBeenCalled();
    });
  });

  describe('webhook verification', () => {
    it('should return 400 if webhook secret is missing', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(POST(request)).rejects.toThrow(
        'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
      );
    });

    it('should return 400 if svix headers are missing', async () => {
      mockHeaders.mockResolvedValue(new Map());

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Error occured -- no svix headers');
    });

    it('should return 400 if webhook verification fails', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'invalid-signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Error occured');
    });
  });

  describe('database errors', () => {
    it('should handle linkExistingSubmissionsToUser errors gracefully', async () => {
      mockLinkExistingSubmissionsToUser.mockResolvedValue({
        rsvpLinked: 0,
        contactLinked: 0,
        errors: ['Database connection failed']
      });

      const webhookData = {
        type: 'user.created',
        data: {
          id: 'user_error123',
          email_addresses: [
            { email_address: 'error@example.com' }
          ]
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockLinkExistingSubmissionsToUser).toHaveBeenCalledWith(
        'user_error123',
        'error@example.com'
      );
    });

    it('should handle unlinkUserSubmissions errors gracefully', async () => {
      mockUnlinkUserSubmissions.mockResolvedValue({
        rsvpUnlinked: 0,
        contactUnlinked: 0,
        errors: ['Database timeout']
      });

      const webhookData = {
        type: 'user.deleted',
        data: {
          id: 'user_error456'
        }
      };

      mockVerify.mockReturnValue(webhookData);

      const request = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'content-type': 'application/json',
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUnlinkUserSubmissions).toHaveBeenCalledWith('user_error456');
    });
  });
});
