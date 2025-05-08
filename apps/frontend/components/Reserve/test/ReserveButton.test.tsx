import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ReserveButton } from '../ReserveButton';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ReserveButton', () => {
  it('renderiza el botón correctamente', () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    render(<ReserveButton />);
    expect(screen.getByRole('button', { name: /reserve a table/i })).toBeInTheDocument();
  });

  it('navega a /reserve al hacer click', () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    render(<ReserveButton />);
    fireEvent.click(screen.getByRole('button', { name: /reserve a table/i }));
    expect(push).toHaveBeenCalledWith('/reserve');
  });
}); 