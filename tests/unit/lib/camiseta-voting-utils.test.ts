import { describe, it, expect } from 'vitest';
import {
  calculateVotingProgress,
  determineWinningDesign,
  formatVotingResults,
  isVotingPeriodActive,
  canUserPreOrder,
  calculatePreOrderStats
} from '@/lib/camiseta-voting-utils';

describe('camiseta-voting-utils', () => {
  describe('calculateVotingProgress', () => {
    it('should calculate correct progress percentage', () => {
      const votes = {
        design_a: 30,
        design_b: 20,
        design_c: 50
      };
      
      const result = calculateVotingProgress(votes);
      
      expect(result.totalVotes).toBe(100);
      expect(result.progress.design_a).toBe(30);
      expect(result.progress.design_b).toBe(20);
      expect(result.progress.design_c).toBe(50);
    });

    it('should handle zero votes', () => {
      const votes = {
        design_a: 0,
        design_b: 0,
        design_c: 0
      };
      
      const result = calculateVotingProgress(votes);
      
      expect(result.totalVotes).toBe(0);
      expect(result.progress.design_a).toBe(0);
      expect(result.progress.design_b).toBe(0);
      expect(result.progress.design_c).toBe(0);
    });

    it('should round percentages to one decimal place', () => {
      const votes = {
        design_a: 1,
        design_b: 1,
        design_c: 1
      };
      
      const result = calculateVotingProgress(votes);
      
      expect(result.progress.design_a).toBe(33.3);
      expect(result.progress.design_b).toBe(33.3);
      expect(result.progress.design_c).toBe(33.3);
    });
  });

  describe('determineWinningDesign', () => {
    it('should determine winning design correctly', () => {
      const votes = {
        design_a: 20,
        design_b: 50,
        design_c: 30
      };
      
      const result = determineWinningDesign(votes);
      
      expect(result.winner).toBe('design_b');
      expect(result.winningVotes).toBe(50);
      expect(result.isTie).toBe(false);
    });

    it('should detect tie when two designs have equal votes', () => {
      const votes = {
        design_a: 30,
        design_b: 30,
        design_c: 20
      };
      
      const result = determineWinningDesign(votes);
      
      expect(result.winner).toBeNull();
      expect(result.winningVotes).toBe(30);
      expect(result.isTie).toBe(true);
    });

    it('should handle all designs having zero votes', () => {
      const votes = {
        design_a: 0,
        design_b: 0,
        design_c: 0
      };
      
      const result = determineWinningDesign(votes);
      
      expect(result.winner).toBeNull();
      expect(result.winningVotes).toBe(0);
      expect(result.isTie).toBe(true);
    });
  });

  describe('formatVotingResults', () => {
    it('should format voting results for display', () => {
      const votes = {
        design_a: 30,
        design_b: 20,
        design_c: 50
      };
      
      const result = formatVotingResults(votes);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        design: 'design_c',
        votes: 50,
        percentage: 50,
        rank: 1
      });
      expect(result[1]).toEqual({
        design: 'design_a',
        votes: 30,
        percentage: 30,
        rank: 2
      });
      expect(result[2]).toEqual({
        design: 'design_b',
        votes: 20,
        percentage: 20,
        rank: 3
      });
    });

    it('should handle tied designs correctly', () => {
      const votes = {
        design_a: 30,
        design_b: 30,
        design_c: 40
      };
      
      const result = formatVotingResults(votes);
      
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(2); // Tied for second
    });
  });

  describe('isVotingPeriodActive', () => {
    it('should return true when current time is within voting period', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const result = isVotingPeriodActive(startDate, endDate, now);
      
      expect(result).toBe(true);
    });

    it('should return false when current time is before voting period', () => {
      const now = new Date('2023-12-15T12:00:00Z');
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const result = isVotingPeriodActive(startDate, endDate, now);
      
      expect(result).toBe(false);
    });

    it('should return false when current time is after voting period', () => {
      const now = new Date('2024-02-15T12:00:00Z');
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const result = isVotingPeriodActive(startDate, endDate, now);
      
      expect(result).toBe(false);
    });
  });

  describe('canUserPreOrder', () => {
    it('should allow pre-order when voting is closed and design is selected', () => {
      const votingStatus = {
        isOpen: false,
        hasEnded: true,
        winningDesign: 'design_a'
      };
      
      const result = canUserPreOrder(votingStatus);
      
      expect(result.canPreOrder).toBe(true);
      expect(result.reason).toBe('voting_complete');
    });

    it('should not allow pre-order when voting is still open', () => {
      const votingStatus = {
        isOpen: true,
        hasEnded: false,
        winningDesign: null
      };
      
      const result = canUserPreOrder(votingStatus);
      
      expect(result.canPreOrder).toBe(false);
      expect(result.reason).toBe('voting_in_progress');
    });

    it('should not allow pre-order when voting ended but no winner', () => {
      const votingStatus = {
        isOpen: false,
        hasEnded: true,
        winningDesign: null
      };
      
      const result = canUserPreOrder(votingStatus);
      
      expect(result.canPreOrder).toBe(false);
      expect(result.reason).toBe('no_winner');
    });
  });

  describe('calculatePreOrderStats', () => {
    it('should calculate pre-order statistics', () => {
      const preOrders = [
        { design: 'design_a', quantity: 2, size: 'M' },
        { design: 'design_a', quantity: 1, size: 'L' },
        { design: 'design_a', quantity: 3, size: 'M' }
      ];
      
      const result = calculatePreOrderStats(preOrders);
      
      expect(result.totalOrders).toBe(3);
      expect(result.totalQuantity).toBe(6);
      expect(result.byDesign.design_a).toBe(6);
      expect(result.bySize.M).toBe(5);
      expect(result.bySize.L).toBe(1);
    });

    it('should handle empty pre-orders', () => {
      const preOrders: any[] = [];
      
      const result = calculatePreOrderStats(preOrders);
      
      expect(result.totalOrders).toBe(0);
      expect(result.totalQuantity).toBe(0);
      expect(result.byDesign).toEqual({});
      expect(result.bySize).toEqual({});
    });

    it('should handle multiple designs', () => {
      const preOrders = [
        { design: 'design_a', quantity: 2, size: 'M' },
        { design: 'design_b', quantity: 1, size: 'L' },
        { design: 'design_c', quantity: 3, size: 'XL' }
      ];
      
      const result = calculatePreOrderStats(preOrders);
      
      expect(result.totalQuantity).toBe(6);
      expect(result.byDesign.design_a).toBe(2);
      expect(result.byDesign.design_b).toBe(1);
      expect(result.byDesign.design_c).toBe(3);
    });
  });
});