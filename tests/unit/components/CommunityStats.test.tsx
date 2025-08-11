import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommunityStats from '@/components/CommunityStats';

describe('CommunityStats', () => {
  describe('Basic rendering', () => {
    it('renders community statistics correctly', () => {
      const { container } = render(<CommunityStats />);

      // Check main container
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'bg-gray-50',
        'rounded-lg',
        'p-6',
        'text-center',
        'border',
        'border-gray-200'
      );
    });

    it('displays statistics grid with correct layout', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      const statsGrid = mainContainer.querySelector('.grid.grid-cols-3.gap-4.mb-4');
      expect(statsGrid).toBeInTheDocument();
    });

    it('shows members statistics', () => {
      render(<CommunityStats />);

      expect(screen.getByText('150+')).toBeInTheDocument();
      expect(screen.getByText('MIEMBROS')).toBeInTheDocument();
    });

    it('shows years statistics', () => {
      render(<CommunityStats />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('AÑOS')).toBeInTheDocument();
    });

    it('shows memories statistics', () => {
      render(<CommunityStats />);

      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('RECUERDOS')).toBeInTheDocument();
    });
  });

  describe('Statistics styling', () => {
    it('applies correct styling to statistic numbers', () => {
      render(<CommunityStats />);

      const membersNumber = screen.getByText('150+');
      const yearsNumber = screen.getByText('15');
      const memoriesNumber = screen.getByText('∞');

      // Check that all stat numbers have correct styling
      [membersNumber, yearsNumber, memoriesNumber].forEach(element => {
        expect(element).toHaveClass('text-2xl', 'font-black', 'text-betis-green');
      });
    });

    it('applies correct styling to statistic labels', () => {
      render(<CommunityStats />);

      const membersLabel = screen.getByText('MIEMBROS');
      const yearsLabel = screen.getByText('AÑOS');
      const memoriesLabel = screen.getByText('RECUERDOS');

      // Check that all stat labels have correct styling
      [membersLabel, yearsLabel, memoriesLabel].forEach(element => {
        expect(element).toHaveClass(
          'text-xs',
          'text-gray-600',
          'font-medium',
          'uppercase'
        );
      });
    });
  });

  describe('Quote section', () => {
    it('displays the community quote', () => {
      render(<CommunityStats />);

      expect(screen.getByText(/Como estar en casa pero viendo el Betis/)).toBeInTheDocument();
    });

    it('applies correct styling to the quote', () => {
      render(<CommunityStats />);

      const quote = screen.getByText(/Como estar en casa pero viendo el Betis/);
      expect(quote).toHaveClass('text-sm', 'text-gray-600', 'italic');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<CommunityStats />);

      // Check that statistics are properly structured
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toBeInTheDocument();
      
      // Statistics should be readable by screen readers
      expect(screen.getByText('150+')).toBeInTheDocument();
      expect(screen.getByText('MIEMBROS')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('AÑOS')).toBeInTheDocument();
      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('RECUERDOS')).toBeInTheDocument();
    });

    it('properly associates statistic values with their labels', () => {
      const { container } = render(<CommunityStats />);

      // Check that values and labels are in the same section
      const mainContainer = container.firstChild as HTMLElement;
      const statsGrid = mainContainer.querySelector('.grid.grid-cols-3');
      expect(statsGrid).toBeInTheDocument();
      expect(statsGrid?.children).toHaveLength(3);
    });
  });

  describe('Layout and structure', () => {
    it('has correct grid layout classes', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      const statsGrid = mainContainer.querySelector('.grid');
      
      expect(statsGrid).toHaveClass('grid', 'grid-cols-3', 'gap-4', 'mb-4');
    });

    it('has three statistic sections', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      const statsGrid = mainContainer.querySelector('.grid.grid-cols-3');
      const statSections = statsGrid?.children;
      
      expect(statSections).toHaveLength(3);
    });

    it('contains quote section below statistics', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      const quote = mainContainer.querySelector('p.text-sm.text-gray-600.italic');
      
      expect(quote).toBeInTheDocument();
      expect(quote?.textContent).toMatch(/Como estar en casa pero viendo el Betis/);
    });
  });

  describe('Component structure', () => {
    it('renders as a single container with proper structure', () => {
      const { container } = render(<CommunityStats />);

      // Should have only one root div
      expect(container.firstChild).toBeInTheDocument();
      expect(container.children).toHaveLength(1);
    });

    it('maintains consistent spacing and margins', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('p-6'); // padding

      const statsGrid = mainContainer.querySelector('.grid');
      expect(statsGrid).toHaveClass('mb-4'); // margin bottom before quote
    });
  });

  describe('Visual design', () => {
    it('uses correct background and border styling', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'bg-gray-50',
        'border',
        'border-gray-200',
        'rounded-lg'
      );
    });

    it('centers content appropriately', () => {
      const { container } = render(<CommunityStats />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('text-center');
    });
  });
});