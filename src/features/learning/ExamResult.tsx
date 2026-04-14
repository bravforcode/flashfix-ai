import React from 'react'
import { useStore } from '@/core/state/useStore'
import { ExamQuestion } from '@/core/state/store.types'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, LayoutDashboard, Loader2, Trophy } from 'lucide-react'
import { clsx } from 'clsx'

export const ExamResult: React.FC = () => {
  const { examResult, examQ, examA, setPage } = useStore()

  if (!examResult) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm">กำลังโหลด...</div>
    </div>
  )

  const { score, total, wrong } = examResult
  const pct = Math.round((score / total) * 100)
  const pass = pct >= 60
  const grade = pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'

  return (
    <div className="animate-fade-in text-center">
      <div className="mb-8 animate-scale-in">
        <div className={clsx(
          "serif text-6xl md:text-7xl font-extrabold leading-none",
          pass ? "text-green-600 dark:text-green-500" : "text-red-700 dark:text-red-600"
        )}>
          {score}/{total}
        </div>
        <div className={clsx(
          "text-sm md:text-base font-bold mt-2 uppercase tracking-widest",
          pass ? "text-green-600 dark:text-green-500" : "text-red-700 dark:text-red-600"
        )}>
          {pct}% · Grade {grade} · {pass ? 'ผ่าน' : 'ต้องพัฒนา'}
        </div>
        <div className="max-w-[200px] mx-auto mt-5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={clsx(
              "h-full transition-all duration-500",
              pass ? "bg-green-600 dark:bg-green-500" : "bg-red-700 dark:bg-red-600"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-10 text-left">
        {examQ.map((q: ExamQuestion, i: number) => {
          const ua = examA[i]
          const correct = ua === q.correct
          return (
            <div 
              key={i} 
              className={clsx(
                "card bg-white dark:bg-slate-800 border-1.5 rounded-xl p-4 md:p-5 flex gap-4 transition-all shadow-sm animate-fade-up",
                correct ? "border-green-100 dark:border-green-900/30" : "border-red-100 dark:border-red-900/30"
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {correct ? <CheckCircle2 size={22} className="text-green-600" /> : <XCircle size={22} className="text-red-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={clsx(
                  "text-[11px] font-bold uppercase tracking-wider mb-1",
                  correct ? "text-green-600" : "text-red-700"
                )}>
                  ข้อ {i + 1} {correct ? 'ถูกต้อง' : 'ไม่ถูกต้อง'}
                </div>
                <div className="text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed truncate md:whitespace-normal">
                  {q.q}
                </div>
                {!correct && (
                  <div className="mt-2.5 space-y-1 bg-red-50/30 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-50 dark:border-red-900/20">
                    <div className="text-[11px] text-red-700 dark:text-red-400 font-bold">คุณตอบ: <span className="font-normal opacity-90">{ua !== undefined ? q.options[ua] : 'ไม่ตอบ'}</span></div>
                    <div className="text-[11px] text-green-700 dark:text-green-500 font-bold">เฉลย: <span className="font-normal opacity-90">{q.options[q.correct]}</span></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {wrong.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-3.5 justify-center">
          <button 
            onClick={() => setPage('exam_mc')}
            className="btn-b bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
            ทบทวนข้อผิด ({wrong.length}) <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => setPage('flashcards')}
            className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-900 dark:hover:bg-red-600 transition-all shadow-md active:scale-95"
          >
            สร้าง Flashcard จากข้อผิด <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="card bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-8 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-green-700 dark:text-green-500 shadow-sm animate-bounce">
            <Trophy size={30} />
          </div>
          <div className="text-xl font-bold text-green-700 dark:text-green-500 mb-2">สมบูรณ์แบบ!</div>
          <p className="text-sm text-green-900/70 dark:text-green-400/70 mb-6">คุณเข้าใจเนื้อหานี้อย่างครบถ้วน</p>
          <button 
            onClick={() => setPage('mastery')}
            className="btn-p bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-900/20"
          >
            ดู Mastery <LayoutDashboard size={18} />
          </button>
        </div>
      )}

      <div className="mt-8">
        <button 
          onClick={() => setPage('home')}
          className="flex items-center gap-1.5 px-5 py-2.5 mx-auto text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <RotateCcw size={16} /> กลับหน้าแรก
        </button>
      </div>
    </div>
  )
}
