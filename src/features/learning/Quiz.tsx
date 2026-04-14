import React from 'react'
import { useStore } from '@/core/state/useStore'
import { ChevronLeft, ArrowRight, Eye, EyeOff, Loader2, HelpCircle, Lightbulb } from 'lucide-react'
import { clsx } from 'clsx'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import { MathText } from '@/shared/components/math/MathText'

export const Quiz: React.FC = () => {
  const { topic, quiz, loading, answer, setAnswer, showAnswer, setShowAnswer, setPage, setSolution, addHistory, updateMastery, mastery } = useStore()
  const difficultyMap = {
    hard: {
      label: 'ยาก',
      badge: 'text-red-700 bg-red-50 dark:bg-red-900/20',
      dot: 'bg-red-600',
    },
    medium: {
      label: 'ปานกลาง',
      badge: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20',
      dot: 'bg-amber-500',
    },
    easy: {
      label: 'ง่าย',
      badge: 'text-green-700 bg-green-50 dark:bg-green-900/20',
      dot: 'bg-green-600',
    },
  } as const
  const difficulty = difficultyMap[quiz?.difficulty ?? 'easy']

  if (!quiz || loading) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm font-medium">AI กำลังสร้างโจทย์...</div>
    </div>
  )

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setPage('solution')
    try {
      const sol = await AIService.solveQuiz()
      setSolution(sol)
      // Record history and update mastery
      if (topic && quiz) {
        addHistory('quiz', {
          topic: topic.th,
          question: quiz.question,
          score: sol.isCorrect ? 1 : 0,
          total: 1,
        })
        const current = mastery[topic.id] ?? 0
        const delta = sol.isCorrect ? 12 : -5
        updateMastery(topic.id, Math.max(0, Math.min(100, current + delta)))
      }
    } catch (e) {
      console.error(e)
      setPage('quiz')
      alert(getReadableAIError(e, 'เกิดข้อผิดพลาดในการตรวจคำตอบ'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="badge px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 text-[11px] font-bold">
          {topic?.th}
        </span>
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          {topic?.jp} · {topic?.lv}
        </span>
        <span className={clsx(
          "badge px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5",
          difficulty.badge
        )}>
          <span className={clsx('w-2 h-2 rounded-full', difficulty.dot)} />
          {difficulty.label}
        </span>
      </div>

      <div className="card bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-6 md:p-8 mb-5 shadow-sm animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={14} className="text-slate-400" />
          <div className="serif text-[10px] tracking-[2px] text-slate-400 uppercase font-bold">Diagnostic Quiz</div>
        </div>
        <div className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed md:leading-loose">
          <MathText text={quiz.question} />
        </div>
        {quiz.hint && (
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 italic">
            <span className="inline-flex items-center gap-1.5">
              <Lightbulb size={12} />
              <MathText text={quiz.hint} />
            </span>
          </div>
        )}
      </div>

      {showAnswer && (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border-1.5 border-amber-200 dark:border-amber-900/30 rounded-xl p-5 mb-5 animate-fade-up shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-500 mb-2.5 flex items-center gap-1.5">
            <Eye size={12} /> เฉลย (ลองทำตามแล้วพิมพ์ด้านล่าง)
          </div>
          <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
            <MathText text={quiz.answer} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          คำตอบ / วิธีทำ
        </label>
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border-1.5",
            showAnswer 
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500" 
              : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          {showAnswer ? <><EyeOff size={12} /> ซ่อนเฉลย</> : <><Eye size={12} /> ดูเฉลย</>}
        </button>
      </div>

      <textarea 
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5} 
        placeholder="พิมพ์วิธีทำและคำตอบ..."
        className="w-full p-4.5 border-1.5 border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:border-red-800 dark:focus:border-red-600 outline-none transition-all shadow-inner mb-6 resize-none"
      />

      <div className="flex justify-between items-center">
        <button 
          onClick={() => setPage('topic_select')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <ChevronLeft size={18} /> เปลี่ยนหัวข้อ
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          ส่งคำตอบ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
