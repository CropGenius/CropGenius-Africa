import { render, screen } from '@testing-library/react';
import { YieldBadge } from '../YieldBadge';

describe('YieldBadge', () => {
  it('renders the yield value and unit correctly', () => {
    render(<YieldBadge value={75} unit="kg" />);
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('applies the correct variant class based on yield value', () => {
    const { rerender } = render(<YieldBadge value={30} unit="kg" />);
    expect(screen.getByTestId('yield-badge')).toHaveClass('bg-red-100 text-red-800');

    rerender(<YieldBadge value={60} unit="kg" />);
    expect(screen.getByTestId('yield-badge')).toHaveClass('bg-yellow-100 text-yellow-800');

    rerender(<YieldBadge value={90} unit="kg" />);
    expect(screen.getByTestId('yield-badge')).toHaveClass('bg-green-100 text-green-800');
  });

  it('handles custom class names', () => {
    const customClass = 'my-custom-class';
    render(<YieldBadge value={50} unit="kg" className={customClass} />);
    expect(screen.getByTestId('yield-badge')).toHaveClass(customClass);
  });

  it('applies correct accessibility attributes', () => {
    const customLabel = 'Crop Yield';
    render(<YieldBadge value={75} unit="kg" ariaLabel={customLabel} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', customLabel);
  });

  it('renders the correct icon based on yield level', () => {
    const { rerender } = render(<YieldBadge value={30} unit="kg" />);
    expect(screen.getByText('↓')).toBeInTheDocument();

    rerender(<YieldBadge value={60} unit="kg" />);
    expect(screen.getByText('→')).toBeInTheDocument();

    rerender(<YieldBadge value={90} unit="kg" />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
});
