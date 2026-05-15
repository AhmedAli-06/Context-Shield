import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../src/context/AuthContext'
import RegisterPage from '../src/pages/RegisterPage'

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      register: mockRegister,
      user: null,
    }),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />)
    
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error for short name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'J')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'short')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows error for password mismatch', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'password456')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows error for duplicate email (409)', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValue({
      response: { status: 409 },
    })
    
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'existing@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button').disabled).toBe(true)
    })
  })

  it('redirects to login on success', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(undefined)
    
    renderWithProviders(<RegisterPage />)
    
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'new@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})