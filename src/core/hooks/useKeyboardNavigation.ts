/**
 * Keyboard Navigation Hook for accessibility
 * Provides keyboard event handling and navigation utilities
 */

import { useEffect, useCallback } from 'react'
import { useStore } from '@/core/state/useStore'
import type { Page } from '@/core/state/store.types'

const PAGE_SHORTCUTS: Record<string, Page> = {
  'h': 'home',
  'u': 'file_upload',
  'q': 'topic_select',
  'm': 'mastery',
  'b': 'bookmarks',
}

export const useKeyboardNavigation = () => {
  const { setPage, page } = useStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts when not typing in input
    const target = e.target as HTMLElement
    const isInputting = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    
    if (isInputting) return

    // Ctrl/Cmd + K for keyboard shortcuts info
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
    }

    // Alt + letter for page navigation
    if (e.altKey && PAGE_SHORTCUTS[e.key.toLowerCase()]) {
      e.preventDefault()
      const newPage = PAGE_SHORTCUTS[e.key.toLowerCase()]
      if (newPage !== page) {
        setPage(newPage)
      }
    }

    // Escape key can close modals (handled by modals themselves)
    // Spacebar for common actions (handled by components)
  }, [page, setPage])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
