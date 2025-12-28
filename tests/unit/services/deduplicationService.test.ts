import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be hoisted
const { mockTokenSortRatio } = vi.hoisted(() => ({
  mockTokenSortRatio: vi.fn(),
}));

// Mock fuzzball
vi.mock('fuzzball', () => ({
  token_sort_ratio: mockTokenSortRatio,
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    business: vi.fn(),
  },
}));

import {
  generateContentHash,
  checkDuplicate,
  type ExistingRumor,
} from '@/services/deduplicationService';

describe('deduplicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContentHash', () => {
    it('should generate consistent hash for same input', () => {
      const hash1 = generateContentHash('Test Title', 'Test Description');
      const hash2 = generateContentHash('Test Title', 'Test Description');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = generateContentHash('Title 1', 'Description 1');
      const hash2 = generateContentHash('Title 2', 'Description 2');

      expect(hash1).not.toBe(hash2);
    });

    it('should normalize content by lowercasing', () => {
      const hash1 = generateContentHash('TEST TITLE', 'TEST DESCRIPTION');
      const hash2 = generateContentHash('test title', 'test description');

      expect(hash1).toBe(hash2);
    });

    it('should trim leading/trailing whitespace from concatenated string', () => {
      const hash1 = generateContentHash('  Title', 'Description  ');
      const hash2 = generateContentHash('  Title', 'Description  ');

      expect(hash1).toBe(hash2);

      // Internal whitespace is preserved (different spacing = different hash)
      const hash3 = generateContentHash('  Title  ', '  Description  ');
      const hash4 = generateContentHash('Title', 'Description');
      expect(hash3).not.toBe(hash4);
    });

    it('should handle undefined description', () => {
      const hash1 = generateContentHash('Title', undefined);
      const hash2 = generateContentHash('Title', '');

      expect(hash1).toBe(hash2);
    });

    it('should return 64-character hex string (SHA256)', () => {
      const hash = generateContentHash('Test', 'Description');

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should include title and description in hash', () => {
      const hashTitleOnly = generateContentHash('Title', undefined);
      const hashBoth = generateContentHash('Title', 'Description');

      expect(hashTitleOnly).not.toBe(hashBoth);
    });
  });

  describe('checkDuplicate', () => {
    const createExistingRumor = (
      id: number,
      title: string,
      description: string | null = null,
      customHash?: string
    ): ExistingRumor => ({
      id,
      title,
      description,
      content_hash: customHash || generateContentHash(title, description || undefined),
    });

    it('should detect exact duplicate by content hash', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Betis firma a jugador', 'Descripción completa'),
      ];

      const result = checkDuplicate('Betis firma a jugador', 'Descripción completa', existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
      expect(result.similarityScore).toBe(100);
    });

    it('should detect exact duplicate with case insensitivity', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'BETIS FIRMA A JUGADOR', 'DESCRIPCIÓN'),
      ];

      const result = checkDuplicate('betis firma a jugador', 'descripción', existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
      expect(result.similarityScore).toBe(100);
    });

    it('should detect exact duplicate with same internal spacing', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Betis firma', 'Descripción'),
      ];

      const result = checkDuplicate('Betis firma', 'Descripción', existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
    });

    it('should handle exact duplicate with undefined description', () => {
      const existingRumors: ExistingRumor[] = [createExistingRumor(1, 'Title Only', null)];

      const result = checkDuplicate('Title Only', undefined, existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
    });

    it('should not flag as duplicate if hash does not match', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Different Title', 'Different Description'),
      ];

      // Mock fuzzy match to return low score
      mockTokenSortRatio.mockReturnValue(50);

      const result = checkDuplicate('New Title', 'New Description', existingRumors);

      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateOfId).toBeUndefined();
    });

    it('should detect fuzzy duplicate with high similarity', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Betis contrata a nuevo delantero', 'Fuentes confirman'),
      ];

      // Mock fuzzy match to return 90% similarity
      mockTokenSortRatio.mockReturnValue(90);

      const result = checkDuplicate(
        'Betis ficha a nuevo atacante',
        'Fuentes lo confirman',
        existingRumors
      );

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
      expect(result.similarityScore).toBe(90);
    });

    it('should not flag as duplicate if similarity is below threshold (85%)', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Betis contrata defensa', 'Noticia importante'),
      ];

      // Mock fuzzy match to return 84% (just below threshold)
      mockTokenSortRatio.mockReturnValue(84);

      const result = checkDuplicate('Completamente diferente', 'Otra noticia', existingRumors);

      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateOfId).toBeUndefined();
      expect(result.similarityScore).toBeUndefined();
    });

    it('should flag as duplicate at exactly 85% threshold', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Similar content', 'Similar description'),
      ];

      // Mock fuzzy match to return exactly 85%
      mockTokenSortRatio.mockReturnValue(85);

      const result = checkDuplicate('Similar content', 'Slightly different', existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(1);
      expect(result.similarityScore).toBe(85);
    });

    it('should find best match among multiple similar items', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Match 1', 'First'),
        createExistingRumor(2, 'Match 2', 'Second'),
        createExistingRumor(3, 'Match 3', 'Third'),
      ];

      // Mock to return different scores for each
      mockTokenSortRatio
        .mockReturnValueOnce(75) // Match 1
        .mockReturnValueOnce(92) // Match 2 - highest
        .mockReturnValueOnce(80); // Match 3

      const result = checkDuplicate('New Item', 'Description', existingRumors);

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateOfId).toBe(2); // Should match the highest score
      expect(result.similarityScore).toBe(92);
    });

    it('should handle empty existingRumors array', () => {
      const result = checkDuplicate('New Title', 'New Description', []);

      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateOfId).toBeUndefined();
      expect(result.contentHash).toBeDefined();
    });

    it('should always return contentHash', () => {
      const existingRumors: ExistingRumor[] = [];

      const result = checkDuplicate('Title', 'Description', existingRumors);

      expect(result.contentHash).toBeDefined();
      expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should check exact match before fuzzy matching', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Exact Match', 'Description'),
      ];

      const result = checkDuplicate('Exact Match', 'Description', existingRumors);

      // Fuzzy matching should not be called for exact matches
      expect(mockTokenSortRatio).not.toHaveBeenCalled();
      expect(result.isDuplicate).toBe(true);
      expect(result.similarityScore).toBe(100);
    });

    it('should call fuzzy matching if no exact match found', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Different Title', 'Different Description'),
      ];

      mockTokenSortRatio.mockReturnValue(50);

      checkDuplicate('New Title', 'New Description', existingRumors);

      expect(mockTokenSortRatio).toHaveBeenCalled();
    });

    it('should combine title and description for fuzzy matching', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'Title', 'Description'),
      ];

      mockTokenSortRatio.mockReturnValue(50);

      checkDuplicate('New Title', 'New Description', existingRumors);

      expect(mockTokenSortRatio).toHaveBeenCalledWith(
        'new title new description',
        'title description'
      );
    });

    it('should handle null description in existing rumor for fuzzy matching', () => {
      const existingRumors: ExistingRumor[] = [createExistingRumor(1, 'Title Only', null)];

      mockTokenSortRatio.mockReturnValue(50);

      checkDuplicate('New Title', 'Description', existingRumors);

      expect(mockTokenSortRatio).toHaveBeenCalledWith(
        'new title description',
        'title only '
      );
    });

    it('should handle undefined description in new rumor for fuzzy matching', () => {
      const existingRumors: ExistingRumor[] = [createExistingRumor(1, 'Title', 'Description')];

      mockTokenSortRatio.mockReturnValue(50);

      checkDuplicate('New Title', undefined, existingRumors);

      expect(mockTokenSortRatio).toHaveBeenCalledWith(
        'new title ',
        'title description'
      );
    });

    it('should lowercase content for fuzzy matching', () => {
      const existingRumors: ExistingRumor[] = [
        createExistingRumor(1, 'UPPERCASE TITLE', 'UPPERCASE DESCRIPTION'),
      ];

      mockTokenSortRatio.mockReturnValue(50);

      checkDuplicate('ANOTHER TITLE', 'ANOTHER DESCRIPTION', existingRumors);

      expect(mockTokenSortRatio).toHaveBeenCalledWith(
        'another title another description',
        'uppercase title uppercase description'
      );
    });
  });
});
