import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageComponent, { FormSuccessMessage, FormErrorMessage, FormLoadingMessage } from '@/components/MessageComponent';

describe('MessageComponent', () => {
  it('should render success message with correct styling', () => {
    const { container } = render(<MessageComponent type="success" message="Operation completed successfully" />);

    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass('bg-betis-verde-light', 'border-betis-verde/20', 'text-betis-verde-dark');
  });

  it('should render error message with correct styling', () => {
    const { container } = render(<MessageComponent type="error" message="An error occurred" />);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    
    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('should render warning message with correct styling', () => {
    const { container } = render(<MessageComponent type="warning" message="Warning message" />);

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    
    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('should render info message with correct styling', () => {
    const { container } = render(<MessageComponent type="info" message="Information message" />);

    expect(screen.getByText('Information message')).toBeInTheDocument();
    
    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('should render with custom className', () => {
    const { container } = render(
      <MessageComponent 
        type="success" 
        message="Test message" 
        className="custom-class" 
      />
    );

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass('custom-class');
  });

  it('should render with title when provided', () => {
    render(
      <MessageComponent 
        type="success" 
        title="Success Title"
        message="Test message" 
      />
    );

    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should hide icon when showIcon is false', () => {
    const { container } = render(
      <MessageComponent 
        type="success" 
        message="Test message"
        showIcon={false}
      />
    );

    // Check that no SVG icon is rendered
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should render messages with empty string', () => {
    const { container } = render(<MessageComponent type="success" message="" />);
    
    // Component should render even with empty message
    expect(container.firstChild).not.toBeNull();
    // Check for the presence of the empty paragraph element instead
    const paragraph = container.querySelector('p.text-base.leading-relaxed');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe('');
  });
});

describe('FormSuccessMessage', () => {
  it('should render form success message', () => {
    render(<FormSuccessMessage message="Form submitted successfully" />);

    expect(screen.getByText('¡Éxito!')).toBeInTheDocument();
    expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<FormSuccessMessage title="Custom Success" message="Form submitted" />);

    expect(screen.getByText('Custom Success')).toBeInTheDocument();
  });
});

describe('FormErrorMessage', () => {
  it('should render form error message', () => {
    render(<FormErrorMessage message="Form validation failed" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Form validation failed')).toBeInTheDocument();
  });
});

describe('FormLoadingMessage', () => {
  it('should render loading message with spinner', () => {
    render(<FormLoadingMessage />);

    expect(screen.getByText('Enviando...')).toBeInTheDocument();
    
    // Check for spinner element
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<FormLoadingMessage message="Processing..." />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});