import type { Meta, StoryObj } from '@storybook/react';
import UserManagement from './UserManagement';
import { http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';

// Mock ROLES from @/lib/roleUtils
jest.mock('@/lib/roleUtils', () => ({
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

const mockUsers = [
  {
    id: 'user_1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
    imageUrl: 'https://via.placeholder.com/40/FFD700/000000?text=AU',
    banned: false,
    emailVerified: true,
  },
  {
    id: 'user_2',
    email: 'moderator@example.com',
    firstName: 'Mod',
    lastName: 'User',
    role: 'moderator',
    createdAt: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
    imageUrl: 'https://via.placeholder.com/40/ADD8E6/000000?text=MU',
    banned: false,
    emailVerified: true,
  },
  {
    id: 'user_3',
    email: 'normal@example.com',
    firstName: 'Normal',
    lastName: 'User',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
    imageUrl: 'https://via.placeholder.com/40/90EE90/000000?text=NU',
    banned: false,
    emailVerified: true,
  },
  {
    id: 'user_4',
    email: 'banned@example.com',
    firstName: 'Banned',
    lastName: 'User',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
    imageUrl: 'https://via.placeholder.com/40/FF6347/000000?text=BU',
    banned: true,
    emailVerified: true,
  },
  {
    id: 'user_5',
    email: 'unverified@example.com',
    firstName: 'Unverified',
    lastName: 'User',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastSignInAt: null,
    imageUrl: 'https://via.placeholder.com/40/D3D3D3/000000?text=UU',
    banned: false,
    emailVerified: false,
  },
];

const meta: Meta<typeof UserManagement> = {
  title: 'Admin/UserManagement',
  component: UserManagement,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk directly
    msw: {
      handlers: [
        http.get('/api/admin/users', () => {
          return HttpResponse.json({ success: true, users: mockUsers });
        }),
        http.patch('/api/admin/users', async ({ request }) => {
          const { userId, role, banned } = await request.json();
          const userIndex = mockUsers.findIndex(u => u.id === userId);
          if (userIndex > -1) {
            if (role) mockUsers[userIndex].role = role;
            if (typeof banned === 'boolean') mockUsers[userIndex].banned = banned;
            return HttpResponse.json({ success: true, message: 'User updated' });
          }
          return HttpResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }),
        http.delete('/api/admin/users', async ({ request }) => {
          const { userId } = await request.json();
          const initialLength = mockUsers.length;
          const newUsers = mockUsers.filter(u => u.id !== userId);
          mockUsers.splice(0, mockUsers.length, ...newUsers); // Update mockUsers in place
          if (mockUsers.length < initialLength) {
            return HttpResponse.json({ success: true, message: 'User deleted' });
          }
          return HttpResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }),
        http.post('/api/admin/roles', async ({ request }) => {
          const { userId, role } = await request.json();
          const userIndex = mockUsers.findIndex(u => u.id === userId);
          if (userIndex > -1) {
            mockUsers[userIndex].role = role;
            return HttpResponse.json({ success: true, message: 'Role assigned' });
          }
          return HttpResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }),
        http.delete('/api/admin/roles', async ({ request }) => {
          const { userId } = await request.json();
          const userIndex = mockUsers.findIndex(u => u.id === userId);
          if (userIndex > -1) {
            mockUsers[userIndex].role = 'user'; // Revert to default role
            return HttpResponse.json({ success: true, message: 'Role removed' });
          }
          return HttpResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof UserManagement>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/admin/users', () => {
          return new Promise(() => {}); // Never resolve to simulate loading
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/admin/users', () => {
          return HttpResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
        }),
      ],
    },
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/admin/users', () => {
          return HttpResponse.json({ success: true, users: [] });
        }),
      ],
    },
  },
};