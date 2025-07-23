import { render, screen } from '@testing-library/react';
import { ProgressMeter } from '../ProgressMeter';

describe('ProgressMeter', () => {
  it('renders the progress bar', () => {
    render(<ProgressMeter progress={50} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('sets the correct ARIA attributes', () => {
    render(<ProgressMeter progress={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies a custom className', () => {
    const customClass = 'my-custom-class';
    render(<ProgressMeter progress={50} className={customClass} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveClass(customClass);
  });

  it('uses a custom aria-label', () => {
    const customLabel = 'Loading...';
    render(<ProgressMeter progress={50} ariaLabel={customLabel} />);
    const progressbar = screen.getByRole('progressbar', { name: customLabel });
    expect(progressbar).toBeInTheDocument();
  });

  it('handles 0% progress', () => {
    render(<ProgressMeter progress={0} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles 100% progress', () => {
    render(<ProgressMeter progress={100} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });
});
