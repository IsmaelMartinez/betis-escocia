import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Field, { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '@/components/Field';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: vi.fn(({ className }) => (
    <div data-testid="alert-circle-icon" className={className} />
  ))
}));

describe('Field Component', () => {
  describe('Basic functionality', () => {
    it('renders label correctly', () => {
      render(
        <Field label="Test Field" htmlFor="test-input">
          <input id="test-input" />
        </Field>
      );
      
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    });

    it('associates label with input correctly', () => {
      render(
        <Field label="Email" htmlFor="email-input">
          <input id="email-input" />
        </Field>
      );
      
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('renders children correctly', () => {
      render(
        <Field label="Test Field" htmlFor="test-input">
          <input id="test-input" placeholder="Enter text" />
        </Field>
      );
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('Required fields', () => {
    it('shows asterisk for required fields', () => {
      render(
        <Field label="Required Field" htmlFor="required-input" required>
          <input id="required-input" />
        </Field>
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    it('does not show asterisk for non-required fields', () => {
      render(
        <Field label="Optional Field" htmlFor="optional-input">
          <input id="optional-input" />
        </Field>
      );
      
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders icon when provided', () => {
      const TestIcon = () => <span data-testid="test-icon">🔧</span>;
      
      render(
        <Field label="Field with Icon" htmlFor="icon-input" icon={<TestIcon />}>
          <input id="icon-input" />
        </Field>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('does not render icon when not provided', () => {
      render(
        <Field label="Field without Icon" htmlFor="no-icon-input">
          <input id="no-icon-input" />
        </Field>
      );
      
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('shows error when touched and error exists', () => {
      render(
        <Field 
          label="Error Field" 
          htmlFor="error-input" 
          error="This field is required"
          touched={true}
        >
          <input id="error-input" />
        </Field>
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(2); // One in field, one in error message
    });

    it('does not show error when not touched', () => {
      render(
        <Field 
          label="Untouched Field" 
          htmlFor="untouched-input" 
          error="This field is required"
          touched={false}
        >
          <input id="untouched-input" />
        </Field>
      );
      
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
      expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument();
    });

    it('does not show error when no error exists', () => {
      render(
        <Field 
          label="Valid Field" 
          htmlFor="valid-input" 
          touched={true}
        >
          <input id="valid-input" />
        </Field>
      );
      
      expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument();
    });

    it('applies error styling when error exists', () => {
      render(
        <Field 
          label="Error Field" 
          htmlFor="error-input" 
          error="This field is required"
          touched={true}
        >
          <input id="error-input" />
        </Field>
      );
      
      const errorIcons = screen.getAllByTestId('alert-circle-icon');
      expect(errorIcons).toHaveLength(2); // One in field, one in error message
      
      // Check that the field error icon has red styling
      const fieldErrorIcon = errorIcons[0];
      expect(fieldErrorIcon).toHaveClass('h-5', 'w-5', 'text-red-500');
      
      const errorText = screen.getByText('This field is required');
      expect(errorText).toHaveClass('text-red-600');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Field 
          label="Custom Field" 
          htmlFor="custom-input" 
          className="custom-field-class"
        >
          <input id="custom-input" />
        </Field>
      );
      
      const fieldContainer = container.firstChild as HTMLElement;
      expect(fieldContainer).toHaveClass('custom-field-class');
    });

    it('combines default and custom classes', () => {
      const { container } = render(
        <Field 
          label="Styled Field" 
          htmlFor="styled-input" 
          className="mt-4 mb-2"
        >
          <input id="styled-input" />
        </Field>
      );
      
      const fieldContainer = container.firstChild as HTMLElement;
      expect(fieldContainer).toHaveClass('space-y-2', 'mt-4', 'mb-2');
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(
        <Field label="Accessible Field" htmlFor="accessible-input">
          <input id="accessible-input" />
        </Field>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'accessible-input');
      
      const label = screen.getByText('Accessible Field');
      expect(label).toHaveAttribute('for', 'accessible-input');
    });

    it('uses semantic HTML structure', () => {
      render(
        <Field label="Semantic Field" htmlFor="semantic-input">
          <input id="semantic-input" />
        </Field>
      );
      
      const label = screen.getByText('Semantic Field');
      expect(label.tagName).toBe('LABEL');
    });
  });
});

describe('ValidatedInput Component', () => {
  describe('Basic functionality', () => {
    it('renders input correctly', () => {
      render(<ValidatedInput placeholder="Enter text" />);
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(<ValidatedInput data-testid="validated-input" />);
      
      const input = screen.getByTestId('validated-input');
      expect(input).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-lg',
        'focus:ring-2'
      );
    });

    it('applies default border color', () => {
      render(<ValidatedInput data-testid="validated-input" />);
      
      const input = screen.getByTestId('validated-input');
      expect(input).toHaveClass('border-gray-300');
    });
  });

  describe('Error states', () => {
    it('applies error styles when touched and error exists', () => {
      render(
        <ValidatedInput 
          data-testid="error-input"
          error="Required field"
          touched={true}
        />
      );
      
      const input = screen.getByTestId('error-input');
      expect(input).toHaveClass('border-red-500', 'focus:ring-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not apply error styles when not touched', () => {
      render(
        <ValidatedInput 
          data-testid="untouched-input"
          error="Required field"
          touched={false}
        />
      );
      
      const input = screen.getByTestId('untouched-input');
      expect(input).toHaveClass('border-gray-300');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-describedby for errors', () => {
      render(
        <ValidatedInput 
          id="error-input"
          error="Required field"
          touched={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-input-error');
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styles', () => {
      render(<ValidatedInput data-testid="disabled-input" disabled />);
      
      const input = screen.getByTestId('disabled-input');
      expect(input).toHaveClass('bg-gray-100', 'text-gray-500', 'cursor-not-allowed');
      expect(input).toBeDisabled();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(
        <ValidatedInput 
          data-testid="custom-input"
          className="custom-input-class"
        />
      );
      
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveClass('custom-input-class');
    });
  });
});

describe('ValidatedTextarea Component', () => {
  describe('Basic functionality', () => {
    it('renders textarea correctly', () => {
      render(<ValidatedTextarea placeholder="Enter description" />);
      
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(<ValidatedTextarea data-testid="validated-textarea" />);
      
      const textarea = screen.getByTestId('validated-textarea');
      expect(textarea).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-lg'
      );
    });
  });

  describe('Error states', () => {
    it('applies error styles when touched and error exists', () => {
      render(
        <ValidatedTextarea 
          data-testid="error-textarea"
          error="Required field"
          touched={true}
        />
      );
      
      const textarea = screen.getByTestId('error-textarea');
      expect(textarea).toHaveClass('border-red-500', 'focus:ring-red-500');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('sets proper accessibility attributes', () => {
      render(
        <ValidatedTextarea 
          id="description"
          error="Required field"
          touched={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'description-error');
    });
  });
});

describe('ValidatedSelect Component', () => {
  describe('Basic functionality', () => {
    it('renders select correctly', () => {
      render(
        <ValidatedSelect data-testid="validated-select">
          <option value="">Select option</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </ValidatedSelect>
      );
      
      expect(screen.getByTestId('validated-select')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(
        <ValidatedSelect data-testid="validated-select">
          <option value="">Select option</option>
        </ValidatedSelect>
      );
      
      const select = screen.getByTestId('validated-select');
      expect(select).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-lg'
      );
    });
  });

  describe('Error states', () => {
    it('applies error styles when touched and error exists', () => {
      render(
        <ValidatedSelect 
          data-testid="error-select"
          error="Please select an option"
          touched={true}
        >
          <option value="">Select option</option>
        </ValidatedSelect>
      );
      
      const select = screen.getByTestId('error-select');
      expect(select).toHaveClass('border-red-500', 'focus:ring-red-500');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('sets proper accessibility attributes', () => {
      render(
        <ValidatedSelect 
          id="category"
          error="Required field"
          touched={true}
        >
          <option value="">Select category</option>
        </ValidatedSelect>
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAttribute('aria-describedby', 'category-error');
    });
  });
});

describe('Integration', () => {
  it('works together as a complete form field', () => {
    render(
      <Field 
        label="Email Address" 
        htmlFor="email"
        required
        error="Please enter a valid email"
        touched={true}
        icon={<span data-testid="email-icon">📧</span>}
      >
        <ValidatedInput 
          id="email"
          type="email"
          placeholder="your@email.com"
          error="Please enter a valid email"
          touched={true}
        />
      </Field>
    );
    
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    expect(screen.getByTestId('email-icon')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});