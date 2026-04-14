import React from 'react'
import { useStore } from '@/core/state/useStore'
import { ChevronLeft, ArrowRight, RotateCcw, Loader2, AlertCircle, GraduationCap } from 'lucide-react'
import { clsx } from 'clsx'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import { MathText } from '@/shared/components/math/MathText'

export const TeachBack: React.FC = () => {
  const { tbResult, setTbResult, loading, teachBack, setTeachBack, setPage, solution, topic, addHistory, updateMastery, mastery } = useStore()

  const handleSubmit = async () => {
    if (teachBack.trim().length < 15) return
    try {
      const result = await AIService.evaluateTeachBack(teachBack)
      setTbResult(result)
      if (topic) {
        addHistory('teachback', {
          topic: topic.th,
          score: result.score,
          total: 10,
        })
        const current = mastery[topic.id] ?? 0
        const bonus = result.passed ? 15 : 5
        updateMastery(topic.id, Math.min(100, current + bonus))
      }
    } catch (e) {
      console.error(e)
      alert(getReadableAIError(e, 'เกิดข้อผิดพลาดในการตรวจ Teach-Back'))
    }
  }

  if (tbResult) {
    const { passed, score, feedback, conceptGap, encouragement } = tbResult
    return (
      <div className="animate-fade-in text-center py-6">
        <div className="mb-8 animate-scale-in">
          <div className={clsx(
            "w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-sm",
            passed ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500"
          )}>
            {passed ? <GraduationCap size={38} /> : <RotateCcw size={38} />}
          </div>
          <div className={clsx(
            "serif text-2xl md:text-3xl font-extrabold mb-1.5",
            passed ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500"
          )}>
            {passed ? 'ผ่าน!' : 'ยังไม่ผ่าน'}
          </div>
          <div className={clsx(
            "text-4xl md:text-5xl font-extrabold leading-none",
            passed ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500"
          )}>
            {score}/10
          </div>
          <div className="max-w-[160px] mx-auto mt-6 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={clsx(
                "h-full transition-all duration-500",
                passed ? "bg-green-600 dark:bg-green-500" : "bg-amber-600 dark:bg-amber-500"
              )}
              style={{ width: `${score * 10}%` }}
            />
          </div>
        </div>

        <div className={clsx(
          "card border-1.5 rounded-2xl p-6 md:p-8 mb-6 text-left shadow-sm",
          passed ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30" : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30"
        )}>
          <div className="text-[13px] md:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed md:leading-loose">
            <MathText text={feedback} />
          </div>
          {conceptGap && (
            <div className="mt-5 p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 shadow-inner">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs md:text-[13px] text-amber-800 dark:text-amber-500 font-bold">
                ยังขาด: <span className="font-normal opacity-90"><MathText text={conceptGap} /></span>
              </div>
            </div>
          )}
        </div>

        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed">
          {encouragement}
        </p>

        <div className="flex gap-4 justify-center items-center">
          {!passed && (
            <button 
              onClick={() => setTbResult(null)}
              className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            >
              <RotateCcw size={18} /> ลองใหม่
            </button>
          )}
          <button 
            onClick={() => setPage('flashcards')}
            className="btn-p bg-red-800 dark:bg-red-700 text-white px-10 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            สร้าง Flashcard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm font-medium">AI กำลังตรวจ Teach-Back...</div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="serif text-[10px] tracking-[3px] text-slate-400 mb-2 uppercase font-bold">TEACH-BACK</div>
        <h2 className="serif text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">อธิบายราวกับสอนเพื่อน</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          อธิบาย error + กฎที่ถูกต้อง — AI จะตรวจอย่างตรงไปตรงมา
        </p>
      </div>

      <div className="card bg-red-50/50 dark:bg-red-900/10 border-1.5 border-red-200 dark:border-red-900/30 rounded-xl p-4.5 md:p-5 mb-5 shadow-sm">
        <div className="text-[11px] font-bold text-red-800 dark:text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <AlertCircle size={12} /> Error ที่เกิด
        </div>
        <div className="text-[13px] md:text-sm text-red-900/80 dark:text-red-200/80 font-bold leading-relaxed">
          {solution?.errorTypeThai || ''}
        </div>
      </div>

      <textarea 
        value={teachBack}
        onChange={(e) => setTeachBack(e.target.value)}
        rows={6} 
        placeholder="อธิบายว่าเกิดอะไร กฎคืออะไร..."
        className="w-full p-4.5 border-1.5 border-slate-200 dark:border-slate-700 rounded-xl text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:border-red-800 dark:focus:border-red-600 outline-none transition-all shadow-inner mb-6 resize-none"
      />

      <div className="flex justify-between items-center">
        <button 
          onClick={() => setPage('solution')}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <ChevronLeft size={18} /> กลับ
        </button>
        <button 
          onClick={handleSubmit}
          disabled={teachBack.trim().length < 15}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          ส่งให้ตรวจ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
