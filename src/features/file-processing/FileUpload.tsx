import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/core/state/useStore'
import { useI18n } from '@/shared/hooks/useI18n'
import {
  FileUp, FileText, ChevronLeft, Upload, Info,
  Image as ImageIcon, AlertCircle, Clock, X,
  Lightbulb, LayoutTemplate, CheckCircle2, Loader2, Eye,
} from 'lucide-react'
import { clsx } from 'clsx'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import { extractFilePayload, isSupportedStudyFile, isSupportedStudyImageMime } from './file-extraction'
import type { LearningHistoryEntry } from '@/core/state/store.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'done' | 'error'
  progress: number
  preview?: string
  imageB64?: string | null
  mime?: string | null
  error?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: number, lang: 'th' | 'en'): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  
  if (diffDays === 0) return lang === 'th' ? 'วันนี้' : 'Today'
  if (diffDays === 1) return lang === 'th' ? 'เมื่อวาน' : 'Yesterday'
  if (diffDays < 7) return lang === 'th' ? `${diffDays} วันที่แล้ว` : `${diffDays} days ago`
  
  const locale = lang === 'th' ? 'th-TH' : 'en-US'
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function fileExtFromName(name?: string): string {
  if (!name) return ''
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function resolveQueueImageMime(file: File): string | null {
  if (isSupportedStudyImageMime(file.type)) {
    return file.type.toLowerCase()
  }

  const ext = fileExtFromName(file.name)

  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'

  return null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i]
}

// Generate preview for images
async function generateImagePreview(file: File): Promise<string> {
  return URL.createObjectURL(file)
}

async function encodeImageToB64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function revokePreviewUrl(preview?: string) {
  if (preview?.startsWith('blob:')) {
    URL.revokeObjectURL(preview)
  }
}

function FileHistoryIcon({ fileName }: { fileName?: string }) {
  const ext = fileExtFromName(fileName)
  if (ext === 'pdf') return <FileText size={18} className="text-red-500" />
  if (ext === 'pptx') return <LayoutTemplate size={18} className="text-orange-500" />
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return <ImageIcon size={18} className="text-blue-500" />
  return <FileText size={18} className="text-slate-400" />
}

// ---------------------------------------------------------------------------
// File preview component
// ---------------------------------------------------------------------------

interface FilePreviewProps {
  file: QueuedFile
  onRemove: (id: string) => void
  onRetry: (id: string) => void
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, onRetry }) => {
  const ext = fileExtFromName(file.file.name)
  const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-mg transition-shadow"
    >
      {/* Preview area */}
      {isImage && file.preview ? (
        <div className="relative w-full h-32 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center">
            <Eye size={20} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <FileHistoryIcon fileName={file.file.name} />
        </div>
      )}

      {/* Info + Status */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={file.file.name}>
          {file.file.name}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          {formatFileSize(file.file.size)}
        </p>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {file.status === 'pending' && (
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          )}
          {file.status === 'processing' && (
            <Loader2 size={14} className="text-red-600 dark:text-red-500 animate-spin" />
          )}
          {file.status === 'done' && (
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-500" />
          )}
          {file.status === 'error' && (
            <AlertCircle size={14} className="text-red-600 dark:text-red-500" />
          )}
          <span className={clsx(
            'text-[10px] font-bold uppercase tracking-wide',
            file.status === 'pending' ? 'text-slate-500 dark:text-slate-400' : '',
            file.status === 'processing' ? 'text-red-600 dark:text-red-500' : '',
            file.status === 'done' ? 'text-emerald-600 dark:text-emerald-500' : '',
            file.status === 'error' ? 'text-red-600 dark:text-red-500' : '',
          )}>
            {file.status === 'pending' ? '待機中' : file.status === 'processing' ? '処理中' : file.status === 'done' ? '完了' : 'エラー'}
          </span>
        </div>

        {/* Progress bar for processing files */}
        {file.status === 'processing' && (
          <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className="text-[10px] text-red-600 dark:text-red-400 leading-snug line-clamp-2">
            {file.error}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.status === 'error' && (
          <button
            onClick={() => onRetry(file.id)}
            className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
            aria-label="再試"
            title="再試"
          >
            <Upload size={14} />
          </button>
        )}
        <button
          onClick={() => onRemove(file.id)}
          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-all"
          aria-label="削除"
          title="削除"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

const ProgressBar: React.FC<{ lang?: 'th' | 'en' }> = ({ lang = 'th' }) => {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Step animation via requestAnimationFrame-based timer
    const start = performance.now()
    const DURATION = 8000 // ms to reach 85%
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(85, (elapsed / DURATION) * 85)
      setWidth(pct)
      if (pct < 85) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
        <span>{lang === 'th' ? 'กำลังวิเคราะห์เนื้อหา...' : 'Analyzing content...'}</span>
        <span>{Math.round(width)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500 transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading overlay (replaces drop zone while analysing)
// ---------------------------------------------------------------------------

const AnalysisOverlay: React.FC<{ lang?: 'th' | 'en' }> = ({ lang = 'th' }) => (
  <motion.div
    key="analysing"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
    className="border-2 border-dashed border-red-300 dark:border-red-700 rounded-3xl p-12 md:p-20 text-center bg-red-50 dark:bg-red-900/10 flex flex-col items-center gap-8"
  >
    {/* Pulsing icon */}
    <div className="relative">
      <div className="w-20 h-20 rounded-3xl bg-red-800 dark:bg-red-600 flex items-center justify-center text-white animate-pulse">
        <FileUp size={40} />
      </div>
      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
      </span>
    </div>

    <div className="space-y-1">
      <p className="text-base font-bold text-slate-800 dark:text-slate-100">
        {lang === 'th' ? 'กำลังประมวลผลไฟล์' : 'Processing file'}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {lang === 'th' 
          ? 'AI กำลังอ่านและวิเคราะห์เนื้อหา — โปรดรอสักครู่'
          : 'AI is reading and analyzing the content — please wait'}
      </p>
    </div>

    <ProgressBar lang={lang} />
  </motion.div>
)

// ---------------------------------------------------------------------------
// Error banner
// ---------------------------------------------------------------------------

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, height: 0, marginTop: 0 }}
    animate={{ opacity: 1, height: 'auto', marginTop: '0.75rem' }}
    exit={{ opacity: 0, height: 0, marginTop: 0 }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden"
  >
    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-2xl px-4 py-3 text-red-800 dark:text-red-400">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="ปิด"
        className="shrink-0 cursor-pointer p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  </motion.div>
)

// ---------------------------------------------------------------------------
// Recent file row
// ---------------------------------------------------------------------------

const RecentFileRow: React.FC<RecentFileRowProps> = ({ entry, onNavigate, lang = 'th' }) => (
  <button
    onClick={() => onNavigate(entry)}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group min-h-[44px] text-left"
  >
    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
      <FileHistoryIcon fileName={entry.data.fileName} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
        {entry.data.title || entry.data.fileName || (lang === 'th' ? 'ไม่ทราบชื่อ' : 'Unknown')}
      </p>
      {entry.data.subject && (
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{entry.data.subject}</p>
      )}
    </div>
    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 shrink-0">
      <Clock size={11} />
      <span>{formatDate(entry.ts, lang)}</span>
    </div>
  </button>
)

interface RecentFileRowProps {
  entry: LearningHistoryEntry
  onNavigate: (entry: LearningHistoryEntry) => void
  lang?: 'th' | 'en'
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const FileUpload: React.FC = () => {
  const { setPage, setFileData, setFileSummary, addHistory, setLoading, loading, history, fileSummary } = useStore()
  const { lang } = useI18n()

  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  const queueRef = useRef<QueuedFile[]>([])
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const processingChainRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      queueRef.current.forEach((queuedFile) => {
        revokePreviewUrl(queuedFile.preview)
      })
    }
  }, [])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  // Recent file-type history (up to 5)
  const recentFiles = (history ?? [])
    .filter((e) => e.type === 'file')
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5)

  // Clear error when loading starts
  useEffect(() => {
    if (loading) setErrorMsg(null)
  }, [loading])

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg)
  }, [])

  const updateQueue = useCallback((updater: React.SetStateAction<QueuedFile[]>) => {
    setQueue(prev => {
      const next = typeof updater === 'function'
        ? (updater as (prevState: QueuedFile[]) => QueuedFile[])(prev)
        : updater

      queueRef.current = next
      return next
    })
  }, [])

  // Generate unique ID for queued files
  const generateId = useCallback(() => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // -------------------------------------------------------------------------
  // Drag handlers
  // -------------------------------------------------------------------------

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true)
    else if (e.type === 'dragleave' || e.type === 'drop') setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      // Add all dropped files to queue
      Array.from(e.dataTransfer.files).forEach(file => {
        void queueFile(file)
      })
    }
  }, [])

  // -------------------------------------------------------------------------
  // Queue file
  // -------------------------------------------------------------------------

  const processQueuedFile = useCallback(async (queuedFile: QueuedFile) => {
    const stillPending = queueRef.current.some((file) => file.id === queuedFile.id && file.status === 'pending')
    if (!stillPending) return

    updateQueue(prev => prev.map(file => file.id === queuedFile.id ? { ...file, status: 'processing', progress: 0 } : file))
    setLoading(true)

    try {
      let progress = 0
      progressIntervalRef.current = setInterval(() => {
        progress = Math.min(progress + Math.random() * 20, 85)
        updateQueue(prev => prev.map(file => file.id === queuedFile.id ? { ...file, progress } : file))
      }, 300)

      const extracted = queuedFile.mime && queuedFile.imageB64
        ? {
            text: '',
            b64: queuedFile.imageB64 || '',
            mime: queuedFile.mime,
          }
        : await extractFilePayload(queuedFile.file)
      if (!isMountedRef.current) return

      setFileData(queuedFile.file.name, extracted.text, extracted.b64, extracted.mime)

      const result = await AIService.analyzeFile()
      if (!isMountedRef.current) return

      setFileSummary(result)
      addHistory('file', {
        title: result.title || queuedFile.file.name,
        fileName: queuedFile.file.name,
        subject: result.subject,
      })

      updateQueue(prev => prev.map(file => file.id === queuedFile.id ? { ...file, status: 'done', progress: 100 } : file))
      setPage('file_summary')
    } catch (e) {
      if (!isMountedRef.current) return

      console.error(e)
      const errorMsg = getReadableAIError(e, lang === 'th' ? 'เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์' : 'An error occurred while analyzing the file.')
      updateQueue(prev => prev.map(file => file.id === queuedFile.id ? { ...file, status: 'error', error: errorMsg } : file))
      showError(errorMsg)
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [addHistory, setFileData, setFileSummary, setLoading, setPage, showError, updateQueue])

  const queueFile = async (file: File) => {
    if (!isSupportedStudyFile(file)) {
      showError(lang === 'th' ? 'รองรับเฉพาะ PDF, PPTX, PNG, JPG และ WebP เท่านั้น' : 'Only PDF, PPTX, PNG, JPG, and WebP formats are supported.')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      showError(lang === 'th' ? 'ขนาดไฟล์เกิน 15 MB กรุณาเลือกไฟล์ที่เล็กกว่านี้' : 'File size exceeds 15 MB. Please select a smaller file.')
      return
    }

    const id = generateId()
    const imageMime = resolveQueueImageMime(file)
    let preview: string | undefined
    let imageB64: string | null = null

    // Generate preview for images
    if (imageMime) {
      preview = await generateImagePreview(file)
      imageB64 = await encodeImageToB64(file)
    }

    const queuedFile: QueuedFile = {
      id,
      file,
      status: 'pending',
      progress: 0,
      preview,
      imageB64,
      mime: imageMime,
    }

    updateQueue(prev => [...prev, queuedFile])

    processingChainRef.current = processingChainRef.current
      .catch(() => undefined)
      .then(() => processQueuedFile(queuedFile))
  }

  // -------------------------------------------------------------------------
  // Remove from queue
  // -------------------------------------------------------------------------

  const handleRemoveFromQueue = useCallback((id: string) => {
    const target = queueRef.current.find((file) => file.id === id)
    revokePreviewUrl(target?.preview)
    updateQueue(prev => prev.filter(f => f.id !== id))
  }, [updateQueue])

  // -------------------------------------------------------------------------
  // Retry failed file
  // -------------------------------------------------------------------------

  const handleRetry = useCallback((id: string) => {
    const target = queueRef.current.find(file => file.id === id)
    if (!target) return

    const retriedFile = { ...target, status: 'pending' as const, error: undefined, progress: 0 }
    updateQueue(prev => prev.map(file => file.id === id ? retriedFile : file))

    processingChainRef.current = processingChainRef.current
      .catch(() => undefined)
      .then(() => processQueuedFile(retriedFile))
  }, [processQueuedFile, updateQueue])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Recent file navigation
  // -------------------------------------------------------------------------

  const handleRecentNavigate = useCallback(
    (entry: LearningHistoryEntry) => {
      // Only navigate if file summary data is still in store and matches this entry
      if (
        fileSummary &&
        (fileSummary.title === entry.data.title || fileSummary.title === entry.data.fileName)
      ) {
        setPage('file_summary')
      }
      // Otherwise read-only: do nothing (no navigation, no error shown)
    },
    [fileSummary, setPage]
  )

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <section>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Upload size={12} /> File Processing
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
          {lang === 'th' ? 'อัปโหลดเอกสาร' : 'Upload Document'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'th' 
            ? 'ให้ AI ช่วยวิเคราะห์ สรุป และสร้างข้อสอบจากไฟล์ของคุณ'
            : 'Let AI analyze, summarize, and create quizzes from your files'}
        </p>
      </section>

      {/* ── Drop Zone / Analysis Overlay ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <AnalysisOverlay key="analysing" lang={lang} />
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label={lang === 'th' ? 'เลือกไฟล์เพื่ออัปโหลด' : 'Select files to upload'}
              className={clsx(
                'group relative border-2 border-dashed rounded-3xl p-14 md:p-24 text-center cursor-pointer',
                'transition-all duration-300 overflow-hidden select-none',
                isDragging
                  ? 'border-red-700 bg-red-50 dark:bg-red-900/10 scale-[0.99] shadow-2xl shadow-red-900/10'
                  : [
                      'border-slate-200 dark:border-slate-700',
                      'bg-white dark:bg-slate-900/50',
                      'hover:border-red-800 dark:hover:border-red-500',
                      'hover:shadow-2xl hover:shadow-red-900/5',
                    ]
              )}
            >
              {/* Decorative background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] dark:opacity-[0.04] group-hover:scale-110 transition-transform duration-700">
                  <FileText size={420} />
                </div>
              </div>

              {/* Drag overlay flash */}
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-50 dark:bg-red-900/10 pointer-events-none rounded-3xl"
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col items-center">
                {/* Icon */}
                <div
                  className={clsx(
                    'w-24 h-24 rounded-3xl mb-6 flex items-center justify-center',
                    'transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
                    isDragging
                      ? 'bg-red-800 text-white'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500'
                  )}
                >
                  <FileUp size={46} />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {isDragging 
                    ? (lang === 'th' ? 'วางไฟล์ที่นี่เลย!' : 'Drop files here now!')
                    : (lang === 'th' ? 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก' : 'Drag files here or click to select')
                  }
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
                  {lang === 'th' 
                    ? 'รองรับ PDF, PowerPoint (.pptx) และรูปภาพ (สูงสุด 15 MB)'
                    : 'Supports PDF, PowerPoint (.pptx), and Images (Max 15MB)'}
                </p>

                {/* Format chips */}
                <div className="flex gap-3 justify-center flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <FileText size={14} className="text-red-500 shrink-0" />
                    PDF Document
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <LayoutTemplate size={14} className="text-orange-500 shrink-0" />
                    PowerPoint (.pptx)
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <ImageIcon size={14} className="text-blue-500 shrink-0" />
                    Images (JPG/PNG/WebP)
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(file => {
                      void queueFile(file)
                    })
                  }

                  e.currentTarget.value = ''
                }}
                accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
              />
            </div>

            {/* Inline error banner */}
            <AnimatePresence>
              {errorMsg && (
                <ErrorBanner
                  key="error"
                  message={errorMsg}
                  onDismiss={() => setErrorMsg(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── File Queue / Preview ── */}
      <AnimatePresence>
        {queue.length > 0 && !loading && (
          <motion.section
            key="queue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                📋 {lang === 'th' ? `ไฟล์ที่รอประมวลผล (${queue.length})` : `Files to Process (${queue.length})`}
              </h3>
              {queue.some(f => f.status === 'done' || f.status === 'error') && (
                <button
                  onClick={() => {
                    queueRef.current
                      .filter((file) => file.status === 'done' || file.status === 'error')
                      .forEach((file) => revokePreviewUrl(file.preview))

                    updateQueue(prev => prev.filter(f => f.status === 'pending' || f.status === 'processing'))
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                >
                  {lang === 'th' ? 'ล้างรายการเสร็จสิ้น' : 'Clear Completed'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {queue.map(qf => (
                <FilePreview
                  key={qf.id}
                  file={qf}
                  onRemove={handleRemoveFromQueue}
                  onRetry={handleRetry}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Recent uploads ── */}
      <AnimatePresence>
        {recentFiles.length > 0 && !loading && (
          <motion.section
            key="recent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={15} className="text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {lang === 'th' ? 'ไฟล์ล่าสุด' : 'Recent Files'}
              </h3>
            </div>
            <div className="space-y-0.5">
              {recentFiles.map((entry, idx) => (
                <RecentFileRow
                  key={`${entry.ts}-${idx}`}
                  entry={entry}
                  onNavigate={handleRecentNavigate}
                  lang={lang}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Tips card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex gap-4 items-start shadow-sm"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
          <Lightbulb size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">
            {lang === 'th' ? 'เคล็ดลับ' : 'Tips'}
          </h4>
          <ul className="space-y-1.5">
            {[
              lang === 'th' 
                ? 'ใช้ไฟล์ที่มีข้อความชัดเจน ไม่ใช่รูปถ่ายเอกสารที่เบลอ'
                : 'Use files with clear text, not blurry document photos.',
              lang === 'th'
                ? 'ขนาดไฟล์ที่เหมาะสมคือ 1–10 MB เพื่อผลลัพธ์ที่รวดเร็ว'
                : 'Optimal file size is 1–10 MB for faster results.',
              lang === 'th'
                ? 'แนะนำให้ใช้ PDF สำหรับผลลัพธ์ที่ดีที่สุด'
                : 'PDF is recommended for the best results.',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── Security info card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 flex gap-4 items-start shadow-sm"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-800 dark:text-blue-400 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
            {lang === 'th' ? 'ความปลอดภัยของข้อมูล' : 'Data Security'}
          </h4>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70 leading-relaxed">
            {lang === 'th'
              ? 'PDF และ PPTX จะถูกสกัดข้อความก่อนส่งวิเคราะห์ ส่วนรูปภาพจะถูกส่งเฉพาะตอนที่คุณสั่งวิเคราะห์จริงเท่านั้น'
              : 'PDFs and PPTXs have text extracted before analysis. Images are only sent when you explicitly request analysis.'}
          </p>
        </div>
      </motion.div>

      {/* ── Back button ── */}
      <div className="flex justify-center pb-2">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer min-h-[44px] rounded-xl"
        >
          <ChevronLeft size={18} />
          {lang === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
        </button>
      </div>
    </div>
  )
}
