import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MathText } from './MathText'

describe('MathText', () => {
  it('renders plain text as text nodes instead of injecting HTML', () => {
    const { container } = render(<MathText text={'ปลอดภัย <img src=x onerror=alert(1)> จริง'} />)

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(/ปลอดภัย/)).toBeInTheDocument()
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('still renders inline KaTeX formulas', () => {
    const { container } = render(<MathText text={'หา $x^2$'} />)

    expect(container.querySelector('.katex')).not.toBeNull()
    expect(container.textContent).toContain('หา')
  })
})
