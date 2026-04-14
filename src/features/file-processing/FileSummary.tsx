import React from 'react'
import { useStore } from '@/core/state/useStore'
import { FileText, ChevronLeft, ArrowRight, Lightbulb, BookOpen, Loader2, PenSquare } from 'lucide-react'

export const FileSummary: React.FC = () => {
  const { fileSummary, fileName, setPage, setExamData } = useStore()

  if (!fileSummary) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm">กำลังโหลด...</div>
    </div>
  )

  const { title, subject, topics, summary, questions } = fileSummary

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-2xl flex-shrink-0">
            <FileText className="text-blue-800 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{title || fileName}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{subject || ''}</div>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(topics || []).map((t: string) => (
            <span key={t} className="badge px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-[11px] font-bold">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 md:p-6 mb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-slate-400" />
          <div className="serif text-[10px] tracking-[2px] text-slate-400 uppercase font-bold">สรุปเนื้อหา</div>
        </div>
        <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed md:leading-loose">
          {summary || ''}
        </p>
      </div>

      <div className="card bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 md:p-6 mb-8 flex justify-between items-center shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-800 dark:text-blue-300">
            <PenSquare size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-800 dark:text-blue-400">ข้อสอบจำลอง</div>
            <div className="text-xs text-blue-600 dark:text-blue-500/80 mt-1 font-medium">
              {(questions || []).length} คำถาม Multiple Choice
            </div>
          </div>
        </div>
        <Lightbulb size={24} className="text-blue-200 dark:text-blue-900/50" />
      </div>

      <div className="flex gap-4 justify-between items-center">
        <button 
          onClick={() => setPage('file_upload')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={16} /> อัปโหลดใหม่
        </button>
        <button
          onClick={() => {
            if (fileSummary?.questions?.length) {
              setExamData(fileSummary.questions)
            }
            setPage('exam_mc')
          }}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-900 dark:hover:bg-red-600 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          เริ่มทำข้อสอบ <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
