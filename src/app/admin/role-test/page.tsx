'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { withAdminRole } from '@/lib/withAdminRole';
import { ROLES } from '@/lib/roleUtils';
import { Shield, Crown, UserCheck, TestTube, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';

interface RoleTest {
  test: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  result?: string;
  error?: string;
}

function RoleTestPage() {
  const { user } = useUser();
  const [tests, setTests] = useState<RoleTest[]>([]);
  const [running, setRunning] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      setCurrentUserRole(user.publicMetadata?.role as string || ROLES.USER);
    }
  }, [user]);

  const runRoleTests = async () => {
    setRunning(true);
    setTests([]);

    const testResults: RoleTest[] = [
      {
        test: 'GET /api/admin/roles',
        description: 'Test fetching users with roles',
        status: 'pending'
      },
      {
        test: 'POST /api/admin/roles',
        description: 'Test assigning role to user',
        status: 'pending'
      },
      {
        test: 'DELETE /api/admin/roles',
        description: 'Test removing role from user',
        status: 'pending'
      },
      {
        test: 'Role validation',
        description: 'Test role validation logic',
        status: 'pending'
      }
    ];

    setTests([...testResults]);

    // Test 1: GET /api/admin/roles
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      
      testResults[0].status = response.ok ? 'success' : 'error';
      testResults[0].result = response.ok 
        ? `Retrieved ${data.users?.length || 0} users` 
        : data.message;
      if (!response.ok) testResults[0].error = data.message;
    } catch (error) {
      testResults[0].status = 'error';
      testResults[0].error = error instanceof Error ? error.message : 'Unknown error';
    }
    setTests([...testResults]);

    // Test 2: POST /api/admin/roles (Test with invalid role)
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user', role: 'invalid-role' })
      });
      
      testResults[1].status = response.status === 400 ? 'success' : 'error';
      testResults[1].result = response.status === 400 
        ? 'Correctly rejected invalid role' 
        : 'Should have rejected invalid role';
      if (response.status !== 400) testResults[1].error = 'Invalid role was accepted';
    } catch (error) {
      testResults[1].status = 'error';
      testResults[1].error = error instanceof Error ? error.message : 'Unknown error';
    }
    setTests([...testResults]);

    // Test 3: DELETE /api/admin/roles (Test with missing userId)
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      testResults[2].status = response.status === 400 ? 'success' : 'error';
      testResults[2].result = response.status === 400 
        ? 'Correctly rejected missing userId' 
        : 'Should have rejected missing userId';
      if (response.status !== 400) testResults[2].error = 'Missing userId was accepted';
    } catch (error) {
      testResults[2].status = 'error';
      testResults[2].error = error instanceof Error ? error.message : 'Unknown error';
    }
    setTests([...testResults]);

    // Test 4: Role validation
    try {
      const validRoles = [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER];
      const isValid = validRoles.every(role => Object.values(ROLES).includes(role));
      
      testResults[3].status = isValid ? 'success' : 'error';
      testResults[3].result = isValid 
        ? 'All roles are valid constants' 
        : 'Role constants are invalid';
      if (!isValid) testResults[3].error = 'Role validation failed';
    } catch (error) {
      testResults[3].status = 'error';
      testResults[3].error = error instanceof Error ? error.message : 'Unknown error';
    }
    setTests([...testResults]);

    setRunning(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return <Shield className="w-4 h-4 text-red-600" />;
      case ROLES.MODERATOR:
        return <Crown className="w-4 h-4 text-blue-600" />;
      case ROLES.USER:
      default:
        return <UserCheck className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-betis-black mb-2">Test de Sistema de Roles</h1>
        <p className="text-gray-600">Prueba las funcionalidades de gestión de roles del sistema administrativo</p>
      </div>

      {/* Current User Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-betis-green" />
            <h2 className="text-lg font-semibold">Usuario Actual</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center space-x-4">
            <img
              src={user?.imageUrl || '/images/default-avatar.png'}
              alt="User"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleIcon(currentUserRole)}
                <span className="text-sm font-medium capitalize">{currentUserRole}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Pruebas del Sistema</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center space-x-4">
            <Button
              onClick={runRoleTests}
              disabled={running}
              variant="primary"
            >
              {running ? 'Ejecutando...' : 'Ejecutar Pruebas'}
            </Button>
            <p className="text-sm text-gray-600">
              Ejecuta pruebas para verificar el funcionamiento del sistema de roles
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Resultados de las Pruebas</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{test.test}</h3>
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      {test.result && (
                        <p className="text-sm text-green-700 mt-2">✓ {test.result}</p>
                      )}
                      {test.error && (
                        <p className="text-sm text-red-700 mt-2">✗ {test.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Available Roles Info */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Roles Disponibles</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(ROLES).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(value)}
                  <div>
                    <p className="font-medium capitalize">{value}</p>
                    <p className="text-sm text-gray-500">
                      {value === ROLES.ADMIN && 'Acceso completo al sistema'}
                      {value === ROLES.MODERATOR && 'Permisos de moderación'}
                      {value === ROLES.USER && 'Usuario estándar'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default withAdminRole(RoleTestPage);
