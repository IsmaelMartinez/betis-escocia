import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import {
  readVotingData,
  writeVotingData,
  sanitizeVotingData,
  getInitialVotingData,
  readVotingDataOrCreate,
  ensureDataDirectory,
  VOTING_DATA_FILE,
  type VotingData,
  type VotingOption,
  type PreOrder,
  type Voter
} from '@/lib/camiseta-voting-utils';

// Mock fs operations to prevent actual file system interactions during testing
vi.mock('fs');

describe('camiseta-voting-utils', () => {
  const mockVotingData: VotingData = {
    voting: {
      active: true,
      totalVotes: 100,
      endDate: '2026-07-31T23:59:59.000Z',
      options: [
        {
          id: 'design_1',
          name: 'Design 1',
          description: 'First design',
          image: '/test1.png',
          votes: 60,
          voters: [
            { name: 'John', email: 'john@test.com', votedAt: '2024-01-01T10:00:00Z' }
          ]
        },
        {
          id: 'design_2',
          name: 'Design 2',
          description: 'Second design',
          image: '/test2.png',
          votes: 40,
          voters: [
            { name: 'Jane', email: 'jane@test.com', votedAt: '2024-01-01T11:00:00Z' }
          ]
        }
      ]
    },
    preOrders: {
      active: true,
      totalOrders: 15,
      endDate: '2026-08-15T23:59:59.000Z',
      minimumOrders: 20,
      orders: []
    },
    stats: {
      lastUpdated: '2024-01-01T12:00:00Z',
      totalInteractions: 100
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ensureDataDirectory', () => {
    it('should create directory if it does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);

      ensureDataDirectory();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true }
      );
    });

    it('should not create directory if it already exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      ensureDataDirectory();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('getInitialVotingData', () => {
    it('should return initial voting data structure', () => {
      const initialData = getInitialVotingData();

      expect(initialData).toHaveProperty('voting');
      expect(initialData).toHaveProperty('preOrders');
      expect(initialData).toHaveProperty('stats');
      expect(initialData.voting.options).toHaveLength(2);
      expect(initialData.voting.totalVotes).toBe(0);
      expect(initialData.preOrders.totalOrders).toBe(0);
    });

    it('should have correct default values', () => {
      const initialData = getInitialVotingData();

      expect(initialData.voting.active).toBe(true);
      expect(initialData.preOrders.minimumOrders).toBe(20);
      expect(initialData.voting.options[0].votes).toBe(0);
      expect(initialData.voting.options[1].votes).toBe(0);
    });
  });

  describe('readVotingData', () => {
    it('should read and parse existing data', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));

      const result = readVotingData();

      expect(result).toEqual(mockVotingData);
      expect(fs.readFileSync).toHaveBeenCalledWith(VOTING_DATA_FILE, 'utf8');
    });

    it('should throw error when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => readVotingData()).toThrow('ENOENT');
    });
  });

  describe('readVotingDataOrCreate', () => {
    it('should read existing data when file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockVotingData));

      const result = readVotingDataOrCreate();

      expect(result).toEqual(mockVotingData);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should create initial data when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const result = readVotingDataOrCreate();

      expect(result).toHaveProperty('voting');
      expect(result).toHaveProperty('preOrders');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        VOTING_DATA_FILE,
        expect.stringContaining('"voting"')
      );
    });
  });

  describe('writeVotingData', () => {
    it('should write data to file with updated timestamp', () => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      const testData = { ...mockVotingData };
      const originalTimestamp = testData.stats.lastUpdated;

      writeVotingData(testData);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        VOTING_DATA_FILE,
        expect.stringContaining('"voting"')
      );
      // Check that timestamp was updated to a more recent time
      expect(testData.stats.lastUpdated).not.toBe(originalTimestamp);
      expect(new Date(testData.stats.lastUpdated).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime());
    });
  });

  describe('sanitizeVotingData', () => {
    it('should remove voter details from options', () => {
      const result = sanitizeVotingData(mockVotingData);

      expect(result.voting.options[0]).not.toHaveProperty('voters');
      expect(result.voting.options[0]).toHaveProperty('percentage');
      expect(result.voting.options[0].percentage).toBe(60);
      expect(result.voting.options[1].percentage).toBe(40);
    });

    it('should calculate pre-order progress percentage', () => {
      const result = sanitizeVotingData(mockVotingData);

      expect(result.preOrders.progressPercentage).toBe(75); // 15/20 * 100
      expect(result.preOrders.isGoalReached).toBe(false);
    });

    it('should indicate when goal is reached', () => {
      const dataWithGoalReached = {
        ...mockVotingData,
        preOrders: {
          ...mockVotingData.preOrders,
          totalOrders: 25
        }
      };

      const result = sanitizeVotingData(dataWithGoalReached);

      expect(result.preOrders.progressPercentage).toBe(125);
      expect(result.preOrders.isGoalReached).toBe(true);
    });

    it('should calculate time remaining correctly', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day from now
      const dataWithFutureDate = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          endDate: futureDate
        }
      };

      const result = sanitizeVotingData(dataWithFutureDate);

      expect(result.voting.timeRemaining).toBeGreaterThan(0);
      expect(result.voting.active).toBe(true);
    });

    it('should handle expired voting period', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      const dataWithPastDate = {
        ...mockVotingData,
        voting: {
          ...mockVotingData.voting,
          endDate: pastDate
        }
      };

      const result = sanitizeVotingData(dataWithPastDate);

      expect(result.voting.timeRemaining).toBe(0);
      expect(result.voting.active).toBe(false);
    });
  });
});