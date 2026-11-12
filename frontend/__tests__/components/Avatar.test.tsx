import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/components/app/Avatar';

describe('Avatar Component', () => {
  it('renders initial letter in uppercase from email', () => {
    render(<Avatar email="sarah@nexus.ai" />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders fallback initial for missing or empty email', () => {
    render(<Avatar email="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies custom size dimension styles', () => {
    const { container } = render(<Avatar email="alex@nexus.ai" size={48} />);
    const avatarEl = container.firstChild as HTMLElement;
    expect(avatarEl).toHaveStyle({ width: '48px', height: '48px' });
  });
});

