import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts value', () => {
    render(<Input value="Test value" readOnly />)
    expect(screen.getByDisplayValue('Test value')).toBeInTheDocument()
  })

  it('fires onChange', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    fireEvent.change(input, { target: { value: 'A' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
  })
  
  it('shows error state when error is true', () => {
    render(<Input error placeholder="Error input" />)
    const input = screen.getByPlaceholderText('Error input')
    expect(input).toHaveClass('border-destructive')
  })
})
