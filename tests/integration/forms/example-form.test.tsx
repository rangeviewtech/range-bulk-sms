import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Simple Example Form Component
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
})

type FormData = z.infer<typeof schema>

function ExampleForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <span role="alert">{errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...register('email')} />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

describe('ExampleForm Integration', () => {
  it('renders the form', () => {
    render(<ExampleForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows validation errors on submit with empty fields', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<ExampleForm onSubmit={handleSubmit} />)
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<ExampleForm onSubmit={handleSubmit} />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      }, expect.anything())
    })
  })
})
