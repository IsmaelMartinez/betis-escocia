import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/camiseta-voting/route';
import fs from 'fs';
import path from 'path';

// Mock fs module
vi.mock('fs');

// Mock path module for better control
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join('/')), 
    dirname: vi.fn((filePath: string) => filePath.split('/').slice(0, -1).join('/'))
  };
});

describe('/api/camiseta-voting', () => {
  const mockVotingData = {
    voting: {
      active: true,
      totalVotes: 0,
      endDate: "2025-07-31T23:59:59.000Z",
      options: [
        {
          id: "design_1",
          name: "Dinnae seek mair – there's nae mair tae be foun'",
          description: "Lema clásico de la peña en escocés",
          image: "/images/coleccionables/camiseta-1.png",
          votes: 0,
          voters: []
        },
        {
          id: "design_2",
          name: "\"No busques más que no hay\"",
          description: "Lema clásico de la peña",
          image: "/images/coleccionables/camiseta-2.png",
          votes: 0,
          voters: []
        }
      ]
    },
    preOrders: {
      active: true,
      totalOrders: 0,
      endDate: "2025-08-15T23:59:59.000Z",
      minimumOrders: 20,
      orders: []
    },
    stats: {
      lastUpdated: "2025-01-15T12:00:00.000Z",
      totalInteractions: 0
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/camiseta-voting', () => {
    it('should return voting data when file exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVotingData);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('camiseta-voting.json'), 'utf8');
    });

    it('should create initial data when file does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('camiseta-voting.json')) return false;
        return true;
      });
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(200);
      expect(data.voting.active).toBe(true);
      expect(data.voting.totalVotes).toBe(0);
      expect(data.preOrders.active).toBe(true);
      expect(data.preOrders.totalOrders).toBe(0);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should create data directory when it does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('data')) return false;
        if (typeof filePath === 'string' && filePath.includes('camiseta-voting.json')) return false;
        return false;
      });
      vi.mocked(fs.mkdirSync).mockImplementation(() => '');
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const response = await GET() as Response;

      expect(response.status).toBe(200);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('data'), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle file not found error', async () => {
      const error = new Error('File not found');
      (error as any).code = 'ENOENT';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw error; });

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('No se encontraron datos de votación previos');
      expect(console.error).toHaveBeenCalledWith('Error reading voting data:', error);
    });

    it('should handle permission error', async () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw error; });

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error de permisos al acceder a los datos de votación');
    });

    it('should handle JSON syntax error', async () => {
      const syntaxError = new SyntaxError('Unexpected token');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw syntaxError; });

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error en el formato de los datos de votación');
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Unknown error');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw genericError; });

      const response = await GET() as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al cargar los datos de votación');
    });
  });

  describe('POST /api/camiseta-voting - Vote Action', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should successfully register a vote', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Voto registrado correctamente');
      expect(data.totalVotes).toBe(1);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should prevent duplicate voting by the same email', async () => {
      const votingDataWithVote = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          totalVotes: 1,
          options: [
            {
              ...mockVotingData.voting.options[0],
              votes: 1,
              voters: [{
                name: 'Test User',
                email: 'test@example.com',
                votedAt: '2025-01-15T10:00:00.000Z'
              }]
            },
            mockVotingData.voting.options[1]
          ]
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(votingDataWithVote));

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_2',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Ya has votado anteriormente. Solo se permite un voto por persona.');
    });

    it('should return error for invalid design ID', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'invalid_design',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('El diseño seleccionado no existe. Por favor, recarga la página.');
    });

    it('should increment vote count and update statistics', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_2',
          voter: {
            name: 'Another User',
            email: 'another@example.com'
          }
        })
      } as unknown as NextRequest;

      await POST(mockRequest);

      // Check that writeFileSync was called with updated data
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      
      expect(writtenData.voting.totalVotes).toBe(1);
      expect(writtenData.stats.totalInteractions).toBe(1);
      expect(writtenData.voting.options[1].votes).toBe(1);
      expect(writtenData.voting.options[1].voters).toHaveLength(1);
    });
  });

  describe('POST /api/camiseta-voting - Pre-order Action', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should successfully register a pre-order', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'preOrder',
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '1234567890',
            size: 'L',
            quantity: 2,
            preferredDesign: 'design_1',
            message: 'Looking forward to it!'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pre-pedido registrado correctamente');
      expect(data.totalOrders).toBe(1);
      expect(data.orderId).toMatch(/^preorder_/);
    });

    it('should prevent duplicate pre-orders by the same email', async () => {
      const votingDataWithVote = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          totalOrders: 1,
          orders: [{
            id: 'preorder_123',
            name: 'Existing Customer',
            email: 'customer@example.com',
            size: 'M',
            quantity: 1,
            submittedAt: '2025-01-15T10:00:00.000Z',
            status: 'pending'
          }]
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(votingDataWithVote));

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'preOrder',
          orderData: {
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '1234567890',
            size: 'L',
            quantity: 2
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Ya tienes un pre-pedido registrado. Solo se permite un pre-pedido por persona.');
    });

    it('should generate unique order ID and set proper timestamps', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'preOrder',
          orderData: {
            name: 'Test Customer',
            email: 'unique@example.com',
            size: 'S',
            quantity: 1
          }
        })
      } as unknown as NextRequest;

      await POST(mockRequest);

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      
      expect(writtenData.preOrders.totalOrders).toBe(1);
      expect(writtenData.stats.totalInteractions).toBe(1);
      expect(writtenData.preOrders.orders).toHaveLength(1);
      
      const newOrder = writtenData.preOrders.orders[0];
      expect(newOrder.id).toMatch(/^preorder_\d+_[a-z0-9]+$/);
      expect(newOrder.status).toBe('pending');
      expect(newOrder.submittedAt).toBeTruthy();
    });

    it('should handle pre-orders with optional fields', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'preOrder',
          orderData: {
            name: 'Minimal Customer',
            email: 'minimal@example.com',
            size: 'M',
            quantity: 1
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/camiseta-voting - Error Handling', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should return error for invalid action', async () => {
      const mockRequest = {
        json: () => Promise.resolve({
          action: 'invalid_action',
          data: {}
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de votación inválidos');
      expect(data.details).toEqual(['Invalid input']);
    });

    it('should handle JSON parsing errors', async () => {
      const mockRequest = {
        json: () => Promise.reject(new SyntaxError('Invalid JSON'))
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Los datos enviados no son válidos. Por favor, revisa la información.');
    });

    it('should handle file system errors during voting', async () => {
      const error = new Error('Disk full');
      (error as any).code = 'ENOSPC';
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw error; });

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno al procesar la solicitud');
      expect(console.error).toHaveBeenCalledWith('Error processing request:', error);
    });

    it('should handle file access errors', async () => {
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw error; });

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'preOrder',
          orderData: {
            name: 'Test Customer',
            email: 'test@example.com',
            size: 'L',
            quantity: 1
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error de almacenamiento. Por favor, inténtalo de nuevo.');
    });

    it('should handle storage space errors', async () => {
      const error = new Error('No space left on device');
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw error; });

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'space-error@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error de espacio de almacenamiento. Contacta al administrador.');
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Unexpected error');
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw genericError; });

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'generic-error@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno al procesar la solicitud');
    });

    it('should handle read errors during POST', async () => {
      const readError = new Error('Cannot read file');
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw readError; });

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Test User',
            email: 'read-error@example.com'
          }
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest) as Response;
      const data = await response!.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno al procesar la solicitud');
    });
  });

  describe('File System Integration', () => {
    it('should update lastUpdated timestamp when writing data', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const beforeTime = Date.now();

      const mockRequest = {
        json: () => Promise.resolve({
          action: 'vote',
          designId: 'design_1',
          voter: {
            name: 'Timestamp User',
            email: 'timestamp@example.com'
          }
        })
      } as unknown as NextRequest;

      await POST(mockRequest);

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      
      const updatedTime = new Date(writtenData.stats.lastUpdated).getTime();
      expect(updatedTime).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should write data to correct file path', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));

      await GET();

      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('camiseta-voting.json'), 'utf8');
    });
  });
});
