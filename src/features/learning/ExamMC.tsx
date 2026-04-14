import React from 'react'
import { useStore } from '@/core/state/useStore'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { MathText } from '@/shared/components/math/MathText'
import { ExamQuestion } from '@/core/state/store.types'

export const ExamMC: React.FC = () => {
  const { examQ, examA, examIdx, setExamAnswer, setExamIdx, setPage, setExamResult, addHistory, fileSummary } = useStore()

  if (!examQ.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm">กำลังโหลด...</div>
    </div>
  )

  const q = examQ[examIdx]
  const total = examQ.length
  const allAns = Object.keys(examA).length === total

  const handleNext = () => {
    if (examIdx < total - 1) setExamIdx(examIdx + 1)
  }

  const handlePrev = () => {
    if (examIdx > 0) setExamIdx(examIdx - 1)
  }

  const handleSubmit = () => {
    let score = 0
    const wrong: number[] = []
    examQ.forEach((question: ExamQuestion, i: number) => {
      if (examA[i] === question.correct) score++
      else wrong.push(i)
    })
    setExamResult({ score, total, wrong })
    addHistory('exam', {
      title: fileSummary?.title || 'ข้อสอบ',
      score,
      total,
    })
    setPage('exam_result')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-2.5">
        <div className="flex justify-between items-center px-1">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">ข้อ {examIdx + 1}/{total}</div>
          <div className="text-xs font-bold text-red-800 dark:text-red-500">{Object.keys(examA).length}/{total} ตอบแล้ว</div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-800 dark:bg-red-600 transition-all duration-300" 
            style={{ width: `${Math.round(((examIdx + 1) / total) * 100)}%` }}
          />
        </div>
        <div className="flex gap-1 mt-1">
          {examQ.map((_: ExamQuestion, i: number) => (
            <div 
              key={i}
              onClick={() => setExamIdx(i)}
              className={clsx(
                "flex-1 h-1 rounded-full cursor-pointer transition-all",
                i === examIdx ? "bg-red-800 dark:bg-red-600" : (examA[i] !== undefined ? "bg-green-600 dark:bg-green-500" : "bg-slate-200 dark:bg-slate-700")
              )}
            />
          ))}
        </div>
      </div>

      <div className="card bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-6 md:p-8 mb-6 shadow-sm animate-scale-in">
        <div className="text-[15px] md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed md:leading-loose">
          <MathText text={q.q} />
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {q.options.map((opt: string, i: number) => {
          const isSelected = examA[examIdx] === i
          return (
            <button 
              key={i}
              onClick={() => setExamAnswer(examIdx, i)}
              className={clsx(
                "flex items-start gap-4 p-4 border-1.5 rounded-xl transition-all text-left bg-white dark:bg-slate-800 group hover:shadow-md",
                isSelected 
                  ? "border-red-800 bg-red-50/30 dark:bg-red-900/10" 
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <div className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                isSelected 
                  ? "bg-red-800 text-white" 
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-900/40"
              )}>
                {'ABCD'[i]}
              </div>
              <span className="text-sm md:text-[15px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                <MathText text={opt} />
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={handlePrev}
          disabled={examIdx === 0}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} /> ก่อนหน้า
        </button>
        
        {allAns ? (
          <button 
            onClick={handleSubmit}
            className="btn-p bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all"
          >
            ส่งคำตอบ <CheckCircle size={18} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={examA[examIdx] === undefined || examIdx === total - 1}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ถัดไป <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
