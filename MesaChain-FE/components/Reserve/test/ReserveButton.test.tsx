import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ReserveButton } from '../ReserveButton';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ReserveButton', () => {
  it('renderiza el botón correctamente', () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    render(<ReserveButton />);
    expect(screen.getByRole('button', { name: /reserve a table/i })).toBeInTheDocument();
  });

  it('navega a /reserve al hacer click', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    render(<ReserveButton />);
    const button = screen.getByRole('button', { name: /reserve a table/i });
    await waitFor(() => expect(button).not.toBeDisabled());
    fireEvent.click(button);
    expect(push).toHaveBeenCalledWith('/reserve');
  });
}); 
