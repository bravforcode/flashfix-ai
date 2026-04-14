import React, { useEffect } from 'react'
import { useStore } from '@/core/state/useStore'
import { LearningHistoryEntry } from '@/core/state/store.types'
import { History, Trash2, X } from 'lucide-react'

const getHistoryTitle = (entry: LearningHistoryEntry) => {
  switch (entry.type) {
    case 'file':
      return entry.data.title || 'ไฟล์'
    case 'quiz':
      return entry.data.topic || 'แบบฝึกหัด'
    case 'exam':
      return `ข้อสอบ ${entry.data.title || ''}`.trim()
    case 'flashcard':
      return entry.data.topic || entry.data.title || 'Flashcard'
    case 'teachback':
      return `Teach-Back ${entry.data.topic || ''}`.trim()
    default:
      return 'กิจกรรม'
  }
}

const getHistorySubtitle = (entry: LearningHistoryEntry) => {
  switch (entry.type) {
    case 'file':
      return entry.data.fileName || ''
    case 'quiz':
      return `${entry.data.question?.substring(0, 72) || ''}${(entry.data.question?.length || 0) > 72 ? '...' : ''}`
    case 'exam':
      return `${entry.data.score}/${entry.data.total} ข้อ`
    case 'flashcard':
      return entry.data.topic || entry.data.title || ''
    case 'teachback':
      return `คะแนน ${entry.data.score}/10`
    default:
      return ''
  }
}

const getHistoryIcon = (type: string) => {
  switch (type) {
    case 'file':
      return 'DOC'
    case 'quiz':
      return 'QZ'
    case 'exam':
      return 'EX'
    case 'flashcard':
      return 'FC'
    case 'teachback':
      return 'TB'
    default:
      return 'HI'
  }
}

const formatHistoryDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
}

export const LearningHistoryDrawer: React.FC = () => {
  const { history, clearHistory, isHistoryOpen, closeHistory } = useStore()

  useEffect(() => {
    if (!isHistoryOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHistory()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [closeHistory, isHistoryOpen])

  if (!isHistoryOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[8500] transition-opacity duration-300 opacity-100 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeHistory} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-history-title"
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 transform translate-x-0"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <History size={18} />
              </div>
              <div>
                <div id="learning-history-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ประวัติการเรียน
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {history.length} รายการ
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearHistory}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                title="ล้างประวัติ"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={closeHistory}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="ปิดประวัติการเรียน"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="text-sm font-bold text-slate-400">ยังไม่มีประวัติการเรียน</div>
                <div className="text-xs text-slate-400 mt-1">เริ่มเรียนรู้เพื่อบันทึกก้าวแรกของคุณ</div>
              </div>
            ) : (
              history.map((entry, index) => {
                const score = entry.type === 'exam' && entry.data?.total
                  ? `${Math.round(((entry.data.score || 0) / entry.data.total) * 100)}%`
                  : ''

                return (
                  <div
                    key={`${entry.ts}-${index}`}
                    className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/30 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {getHistoryIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-red-800 dark:group-hover:text-red-500 transition-colors">
                          {getHistoryTitle(entry)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {getHistorySubtitle(entry)}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-[10px] text-slate-400 font-medium">
                            {formatHistoryDate(entry.ts)}
                          </div>
                          {score && (
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              parseInt(score, 10) >= 60
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-500'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500'
                            }`}>
                              Score: {score}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
