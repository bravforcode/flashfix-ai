import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Navbar } from './Navbar'

const storeState = {
  page: 'home',
  setPage: vi.fn(),
  theme: 'light',
  toggleTheme: vi.fn(),
  mastery: { algebra: 40, calculus: 50 },
  openApiSettings: vi.fn(),
  openHistory: vi.fn(),
}

const setLang = vi.fn()

vi.mock('@/core/state/useStore', () => ({
  useStore: () => storeState,
}))

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) =>
      ({
        home: 'หน้าหลัก',
        file_upload: 'อัปโหลดไฟล์',
        quiz: 'ควิซวัดระดับ',
        mastery: 'ความชำนาญ',
        bookmarks: 'บุ๊กมาร์ก',
      }[key] ?? key),
    lang: 'th',
    setLang,
  }),
}))

vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: keyof JSX.IntrinsicElements) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) =>
      React.createElement(tag, { ...props, ref }, children)
    )

  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) => createMotionComponent(tag as keyof JSX.IntrinsicElements),
    }
  )

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion,
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storeState.page = 'home'
    storeState.theme = 'light'
    storeState.mastery = { algebra: 40, calculus: 50 }
  })

  it('closes the settings menu when Escape is pressed', () => {
    render(<Navbar />)

    fireEvent.click(screen.getByLabelText('Settings'))

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes the mobile menu when Escape is pressed', () => {
    render(<Navbar />)

    fireEvent.click(screen.getByLabelText('Toggle menu'))

    expect(screen.getByText('Overall Mastery')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByText('Overall Mastery')).not.toBeInTheDocument()
  })
})
