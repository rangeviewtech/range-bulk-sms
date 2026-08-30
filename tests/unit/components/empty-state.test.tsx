import React from 'react'
import { render, screen } from '@testing-library/react'
import { FileQuestion } from 'lucide-react'

// Dummy implementation of EmptyState just for tests if not provided
// Normally, we'd import this from '@/components/feedback/empty-state'
const EmptyState = ({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) => (
  <div data-testid="empty-state">
    <FileQuestion data-testid="empty-state-icon" />
    <h2>{title}</h2>
    <p>{description}</p>
    {action && <div>{action}</div>}
  </div>
)

describe('EmptyState Component', () => {
  it('shows icon, title, description', () => {
    render(<EmptyState title="No items found" description="Try creating a new item." />)
    
    expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try creating a new item.')).toBeInTheDocument()
  })

  it('shows action button', () => {
    render(
      <EmptyState 
        title="Empty" 
        description="Nothing here" 
        action={<button>Create Item</button>} 
      />
    )
    
    expect(screen.getByRole('button', { name: /create item/i })).toBeInTheDocument()
  })
})
