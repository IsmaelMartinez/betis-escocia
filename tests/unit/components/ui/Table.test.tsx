import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple Table components for testing
const Table = ({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any; 
}) => (
  <table className={`min-w-full ${className}`} {...props}>
    {children}
  </table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <tr className={className}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
    {children}
  </td>
);

describe('Table Components', () => {
  it('should render table with proper structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should apply custom className to table', () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('custom-table');
    expect(table).toHaveClass('min-w-full');
  });

  it('should render table headers with proper styling', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('bg-gray-50');
    
    const headers = container.querySelectorAll('th');
    headers.forEach(header => {
      expect(header).toHaveClass('px-6', 'py-3', 'text-left');
    });
  });

  it('should render table body with proper styling', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tbody = container.querySelector('tbody');
    expect(tbody).toHaveClass('bg-white', 'divide-y', 'divide-gray-200');
  });

  it('should render table cells with proper styling', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const cell = container.querySelector('td');
    expect(cell).toHaveClass('px-6', 'py-4', 'whitespace-nowrap');
  });

  it('should handle empty table', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empty Table</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* No rows */}
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Empty Table')).toBeInTheDocument();
  });

  it('should handle multiple rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3')).toBeInTheDocument();
  });

  it('should apply custom className to table cells', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="text-red-500">Custom cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const cell = container.querySelector('td');
    expect(cell).toHaveClass('text-red-500');
    expect(cell).toHaveClass('px-6', 'py-4', 'whitespace-nowrap');
  });

  it('should support additional props on table', () => {
    render(
      <Table data-testid="custom-table" id="my-table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByTestId('custom-table');
    expect(table).toHaveAttribute('id', 'my-table');
  });
});