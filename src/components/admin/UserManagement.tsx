'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Shield, Edit2, Trash2, Ban, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import MessageComponent from '@/components/MessageComponent';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastSignInAt: string | null;
  imageUrl: string;
  banned: boolean;
  emailVerified: boolean;
}

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className = '' }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Error fetching users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { role?: string; banned?: boolean }) => {
    try {
      setUpdatingUser(userId);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...updates }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
        await fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: 'error', text: data.message || 'Error updating user' });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage({ type: 'error', text: 'Error updating user' });
    } finally {
      setUpdatingUser(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setUpdatingUser(userId);
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
        await fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: 'error', text: data.message || 'Error deleting user' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage({ type: 'error', text: 'Error deleting user' });
    } finally {
      setUpdatingUser(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'user':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Usuario
          </span>
        );
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Ban className="w-3 h-3 mr-1" />
          Bloqueado
        </span>
      );
    }

    if (user.emailVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verificado
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <UserX className="w-3 h-3 mr-1" />
        Sin verificar
      </span>
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-8`}>
        <LoadingSpinner size="lg" label="Cargando usuarios..." />
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-betis-green" />
              <h2 className="text-xl font-bold text-betis-black">Gestión de Usuarios</h2>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
            >
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {message && (
            <div className="mb-4">
              <MessageComponent type={message.type} message={message.text} />
            </div>
          )}

          {error && (
            <div className="mb-4">
              <MessageComponent type="error" message={error} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.imageUrl || '/images/default-avatar.png'}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastSignInAt 
                        ? new Date(user.lastSignInAt).toLocaleDateString('es-ES')
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Role toggle */}
                        <button
                          onClick={() => updateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                          disabled={updatingUser === user.id}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white transition-colors ${
                            user.role === 'admin' 
                              ? 'bg-orange-600 hover:bg-orange-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } disabled:opacity-50`}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>

                        {/* Ban/Unban toggle */}
                        <button
                          onClick={() => updateUser(user.id, { banned: !user.banned })}
                          disabled={updatingUser === user.id}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white transition-colors ${
                            user.banned 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } disabled:opacity-50`}
                        >
                          {user.banned ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                          {user.banned ? 'Desbloquear' : 'Bloquear'}
                        </button>

                        {/* Delete user */}
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={updatingUser === user.id}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron usuarios en el sistema.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
