import { describe, it, expect } from 'vitest';

// Simple array utility functions for testing
const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const sortByProperty = <T>(array: T[], property: keyof T, ascending: boolean = true): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

describe('Array Utilities', () => {
  it('should remove duplicates from array', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty arrays', () => {
    expect(unique([])).toEqual([]);
  });

  it('should shuffle array elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
    // Note: Due to randomness, we can't test exact order
  });

  it('should not mutate original array when shuffling', () => {
    const original = [1, 2, 3];
    const shuffled = shuffle(original);
    
    expect(original).toEqual([1, 2, 3]);
    expect(shuffled).not.toBe(original);
  });

  it('should chunk arrays into smaller arrays', () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
    expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]);
  });

  it('should handle edge cases in chunking', () => {
    expect(chunk([], 2)).toEqual([]);
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('should sort by object property', () => {
    const data = [
      { name: 'Charlie', age: 25 },
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 20 }
    ];

    const sortedByName = sortByProperty(data, 'name');
    expect(sortedByName[0].name).toBe('Alice');
    expect(sortedByName[1].name).toBe('Bob');
    expect(sortedByName[2].name).toBe('Charlie');

    const sortedByAge = sortByProperty(data, 'age');
    expect(sortedByAge[0].age).toBe(20);
    expect(sortedByAge[1].age).toBe(25);
    expect(sortedByAge[2].age).toBe(30);
  });

  it('should sort in descending order', () => {
    const data = [
      { name: 'Alice', score: 100 },
      { name: 'Bob', score: 200 },
      { name: 'Charlie', score: 150 }
    ];

    const sorted = sortByProperty(data, 'score', false);
    expect(sorted[0].score).toBe(200);
    expect(sorted[1].score).toBe(150);
    expect(sorted[2].score).toBe(100);
  });

  it('should group array elements by property', () => {
    const data = [
      { name: 'Alice', team: 'A' },
      { name: 'Bob', team: 'B' },
      { name: 'Charlie', team: 'A' },
      { name: 'David', team: 'B' }
    ];

    const grouped = groupBy(data, 'team');
    expect(grouped['A']).toHaveLength(2);
    expect(grouped['B']).toHaveLength(2);
    expect(grouped['A'][0].name).toBe('Alice');
    expect(grouped['A'][1].name).toBe('Charlie');
  });

  it('should handle empty arrays in groupBy', () => {
    const grouped = groupBy([], 'team' as any);
    expect(grouped).toEqual({});
  });
});