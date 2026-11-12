import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/app/EmptyState';

describe('EmptyState Component', () => {
  it('renders title, description and icon', () => {
    render(
      <EmptyState
        icon="📋"
        title="No Tasks Found"
        desc="Create your first task to get started."
      />
    );

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first task to get started.')).toBeInTheDocument();
  });

  it('renders optional action button when provided', () => {
    render(
      <EmptyState
        icon="📁"
        title="No Documents"
        desc="Your knowledge base is empty."
        action={<button>Upload Document</button>}
      />
    );

    const button = screen.getByRole('button', { name: /upload document/i });
    expect(button).toBeInTheDocument();
  });
});

