import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../src/context/AuthContext'
import LoginPage from '../src/pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
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

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithProviders(<LoginPage />)
    
    expect(screen.getByPlaceholderText('admin@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('shows error for invalid credentials (401 from API)', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue({
      response: { status: 401 },
    })
    
    renderWithProviders(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('shows error for account locked (403)', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue({
      response: { status: 403 },
    })
    
    renderWithProviders(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/account locked/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    
    await waitFor(() => {
      expect(screen.getByRole('button').disabled).toBe(true)
    })
  })

  it('redirects on success', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    
    renderWithProviders(<LoginPage />)
    
    await user.type(screen.getByPlaceholderText('admin@company.com'), 'admin@company.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})