import React from 'react'
import { useStore } from '@/core/state/useStore'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Loader2, ChevronLeft, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { AIService } from '@/core/api/ai'
import { MathText } from '@/shared/components/math/MathText'
import { SolutionStep } from '@/core/state/store.types'

export const Solution: React.FC = () => {
  const { solution, loading, activeTab, setActiveTab, setPage, answer, quiz, topic, setQuiz } = useStore()

  if (loading || !solution) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm font-medium">AI กำลังตรวจคำตอบ...</div>
    </div>
  )

  const handleRetry = async () => {
    setPage('quiz')
    if (topic) {
      try {
        const quiz = await AIService.generateQuiz(topic)
        setQuiz(quiz)
      } catch (e) {
        console.error(e)
      }
    }
  }

  if (solution.isCorrect) return (
    <div className="animate-fade-in text-center py-6">
      <div className="bg-green-50 dark:bg-green-900/10 border-1.5 border-green-200 dark:border-green-900/30 rounded-2xl p-8 md:p-12 text-center mb-8 animate-scale-in shadow-sm shadow-green-900/5">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-green-700 dark:text-green-500 shadow-sm animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <div className="text-2xl font-bold text-green-700 dark:text-green-500 mb-2.5">ถูกต้องสมบูรณ์!</div>
        <p className="text-sm text-green-900/70 dark:text-green-400/70 leading-relaxed">
          AI ตรวจแล้ว — คำตอบของคุณถูกต้อง
        </p>
      </div>
      <div className="flex gap-4 justify-center">
        <button 
          onClick={handleRetry}
          className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <RotateCcw size={18} /> ทำใหม่
        </button>
        <button 
          onClick={() => setPage('mastery')}
          className="btn-p bg-green-700 hover:bg-green-800 text-white px-10 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-900/20"
        >
          ดู Mastery <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        {[
          { id: 'solution', label: 'เฉลยทีละขั้น' },
          { id: 'compare', label: 'เปรียบเทียบ' },
          { id: 'keyrule', label: 'กฎสำคัญ' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all uppercase tracking-widest",
              activeTab === tab.id 
                ? "text-red-800 dark:text-red-500 border-red-800 dark:border-red-500" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'solution' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-red-50 dark:bg-red-900/10 border-1.5 border-red-200 dark:border-red-900/30 rounded-xl p-4.5 md:p-5 mb-5 shadow-sm">
            <div className="text-[11px] font-bold text-red-800 dark:text-red-500 uppercase tracking-widest mb-1.5">
              {solution.errorType || ''} · {solution.errorTypeThai || ''}
            </div>
            <div className="text-[13px] md:text-sm text-red-900/80 dark:text-red-200/80 font-medium leading-relaxed">
              <MathText text={solution.studentMistake || ''} />
            </div>
          </div>
          
          {(solution.steps || []).map((s: SolutionStep, i: number) => (
            <div 
              key={i} 
              className="flex gap-4 p-4.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                {s.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] md:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  <MathText text={s.title} />
                </div>
                {s.math && (
                  <div className="text-xs md:text-sm text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-lg p-3 md:p-4 whitespace-pre-wrap font-mono leading-relaxed mb-2.5 shadow-inner">
                    <MathText text={s.math} />
                  </div>
                )}
                <div className="text-xs md:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <MathText text={s.explain} />
                </div>
              </div>
            </div>
          ))}

          {solution.commonTrap && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-0.5 block">กับดักพบบ่อย</span>
                <div className="text-xs md:text-[13px] text-amber-900/80 dark:text-amber-200/80 font-medium leading-relaxed">
                  <MathText text={solution.commonTrap} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <div className="text-[11px] font-bold text-red-700 dark:text-red-500 uppercase tracking-widest mb-2.5 px-1 flex items-center gap-1.5">
              <XCircle size={12} /> คำตอบคุณ
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4.5 shadow-inner">
              <div className="text-xs md:text-sm text-red-900/80 dark:text-red-200/80 whitespace-pre-wrap font-mono leading-relaxed">
                <MathText text={solution.studentAnswer || answer} />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-green-700 dark:text-green-500 uppercase tracking-widest mb-2.5 px-1 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> เฉลยถูก
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4.5 shadow-inner">
              <div className="text-xs md:text-sm text-green-900/80 dark:text-green-200/80 whitespace-pre-wrap font-mono leading-relaxed">
                <MathText text={quiz?.answer || ''} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keyrule' && (
        <div className="animate-fade-in space-y-4">
          <div className="card bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={14} className="text-blue-400" />
              <div className="serif text-[10px] tracking-[2px] text-blue-400 uppercase font-bold">Key Rule</div>
            </div>
            <div className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed md:leading-loose">
              <MathText text={solution.keyRule || ''} />
            </div>
          </div>
          {solution.severity && (
            <div className="px-1">
              <span className={clsx(
                "badge px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                solution.severity === 'fundamental' ? "text-red-700 bg-red-50 dark:bg-red-900/20" : 
                solution.severity === 'major' ? "text-amber-700 bg-amber-50 dark:bg-amber-900/20" : 
                "text-green-700 bg-green-50 dark:bg-green-900/20"
              )}>
                Error Level: {solution.severity}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="h-px bg-slate-100 dark:bg-slate-800 my-8" />
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setPage('quiz')}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <ChevronLeft size={18} /> แก้ใหม่
        </button>
        <button 
          onClick={() => setPage('teach_back')}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all"
        >
          Teach-Back <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
