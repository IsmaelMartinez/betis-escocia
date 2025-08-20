import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageComponent from '@/components/MessageComponent';

describe('MessageComponent', () => {
  it('should render success message with correct styling', () => {
    render(<MessageComponent type="success" message="Operation completed successfully" />);

    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('should render error message with correct styling', () => {
    render(<MessageComponent type="error" message="An error occurred" />);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should render warning message with correct styling', () => {
    render(<MessageComponent type="warning" message="Warning message" />);

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('should render info message with correct styling', () => {
    render(<MessageComponent type="info" message="Information message" />);

    expect(screen.getByText('Information message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('should render with custom className', () => {
    render(
      <MessageComponent 
        type="success" 
        message="Test message" 
        className="custom-class" 
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('should not render when message is empty', () => {
    const { container } = render(<MessageComponent type="success" message="" />);
    
    expect(container.firstChild).toBeNull();
  });
});