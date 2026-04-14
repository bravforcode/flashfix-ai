import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { useStore } from '@/core/state/useStore'

class MockFileReader {
  result: string | ArrayBuffer | null = 'data:image/png;base64,ZmFrZQ=='
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null

  readAsDataURL() {
    this.onload?.({ target: { result: this.result } } as ProgressEvent<FileReader>)
  }
}

describe('App navigation after file upload', () => {
  beforeEach(() => {
    localStorage.clear()
    useStore.setState(useStore.getInitialState())
    useStore.setState({
      page: 'file_upload',
      pdpaAccepted: true,
      onboardingSeen: true,
      provider: 'local',
      history: [],
      mastery: {},
      fileName: '',
      fileText: '',
      fileB64: null,
      fileMime: null,
      fileSummary: null,
      loading: false,
    })

    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader)
  })

  it('shows the summary and still allows switching to mastery', async () => {
    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement | null

    expect(input).not.toBeNull()

    const imageFile = new File(['fake-image'], 'playwright-test-image.png', {
      type: 'image/png',
    })

    fireEvent.change(input!, { target: { files: [imageFile] } })

    await waitFor(() => {
      expect(screen.getByText('ข้อสอบจำลอง')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'ความชำนาญ' }))

    await waitFor(() => {
      expect(screen.getByText('ความก้าวหน้าของคุณ')).toBeInTheDocument()
    })
  })
})
