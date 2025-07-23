import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserTable, User, PaginationInfo } from '../UserTable';

const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', full_name: 'Admin User', role: 'admin', created_at: '2023-01-01T12:00:00Z', onboarding_completed: true, ai_usage_count: 10 },
  { id: '2', email: 'farmer@example.com', full_name: 'John Farmer', role: 'farmer', created_at: '2023-02-15T08:30:00Z', onboarding_completed: true, ai_usage_count: 5 },
  { id: '3', email: 'viewer@example.com', full_name: 'Jane Viewer', role: 'viewer', created_at: '2023-03-20T18:45:00Z', onboarding_completed: false, ai_usage_count: 0 },
];

const mockPagination: PaginationInfo = {
  total: 3,
  totalPages: 1,
  currentPage: 1,
  hasNext: false,
  hasPrev: false,
};

const mockHandlers = {
  onSearchChange: vi.fn(),
  onSortChange: vi.fn(),
  onRoleFilterChange: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onEditUser: vi.fn(),
  onDeleteUser: vi.fn(),
  onViewUser: vi.fn(),
};

describe('UserTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user data correctly', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('farmer@example.com')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('handles search input and calls onSearchChange', async () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />);
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'Farmer' } });
    await waitFor(() => {
      expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('Farmer');
    });
  });

  it('handles role filtering', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} />);
    const filterTrigger = screen.getByRole('combobox', { name: /filter by role/i });
    fireEvent.mouseDown(filterTrigger);
    const adminOption = screen.getByRole('option', { name: 'Admin' });
    fireEvent.click(adminOption);
    expect(mockHandlers.onRoleFilterChange).toHaveBeenCalledWith('admin');
  });

  it('handles sorting correctly', () => {
    render(<UserTable users={mockUsers} {...mockHandlers} sortBy="full_name" sortOrder="asc" />);
    const nameHeader = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameHeader);
    expect(mockHandlers.onSortChange).toHaveBeenCalledWith('full_name', 'desc');
  });

  it('displays loading skeletons when isLoading is true', () => {
    render(<UserTable users={[]} isLoading={true} {...mockHandlers} />);
    const skeletons = screen.getAllByRole('row').slice(1).flatMap(row => screen.getAllByRole('cell', { name: /loading/i }));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays empty state when no users are provided', () => {
    render(<UserTable users={[]} {...mockHandlers} />);
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    const paginatedProps = {
      ...mockHandlers,
      users: mockUsers,
      pagination: { ...mockPagination, total: 30, totalPages: 3, currentPage: 2, hasNext: true, hasPrev: true },
      pageSize: 10,
    };
    render(<UserTable {...paginatedProps} />);
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(3);
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(4);
  });

  it('should handle page size change', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const pageSizeSelect = screen.getByDisplayValue('10');
    fireEvent.click(pageSizeSelect);
    
    const option25 = screen.getByText('25');
    fireEvent.click(option25);

    expect(mockHandlers.onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('should handle user actions from dropdown menu', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    // Click on the first user's action menu
    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    // Test view action
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);
    expect(mockHandlers.onViewUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should handle edit user action', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    const editButton = screen.getByText('Edit Role');
    fireEvent.click(editButton);
    expect(mockHandlers.onEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should handle delete user action', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    const deleteButton = screen.getByText('Delete User');
    fireEvent.click(deleteButton);
    expect(mockHandlers.onDeleteUser).toHaveBeenCalledWith(mockUsers[0].id);
  });

  it('should format dates correctly', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument(); // Admin created date
    expect(screen.getByText('Jun 1, 2023')).toBeInTheDocument(); // Farmer created date
    expect(screen.getByText('Dec 1, 2023')).toBeInTheDocument(); // Admin last login
  });

  it('should handle users without optional fields', () => {
    const incompleteUser: User = {
      id: '4',
      email: 'incomplete@example.com'
    };

    render(
      <UserTable 
        {...defaultProps} 
        {...mockHandlers} 
        users={[incompleteUser]} 
      />
    );

    expect(screen.getByText('Unnamed User')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument(); // Role badge
    expect(screen.getByText('Never')).toBeInTheDocument(); // Last login
  });

  it('should disable pagination buttons appropriately', () => {
    const singlePageProps = {
      ...defaultProps,
      pagination: {
        total: 5,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrev: false
      }
    };

    render(<UserTable {...singlePageProps} {...mockHandlers} />);

    const prevButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-chevron-left')
    );
    const nextButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-chevron-right')
    );

    prevButtons.forEach(btn => expect(btn).toBeDisabled());
    nextButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});