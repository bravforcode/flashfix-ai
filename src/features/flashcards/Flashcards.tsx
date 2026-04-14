import React, { useEffect } from 'react'
import { useStore } from '@/core/state/useStore'
import { MiniQuizItem } from '@/core/state/store.types'
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, RotateCcw, ArrowRight, Loader2, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import { MathText } from '@/shared/components/math/MathText'

export const Flashcards: React.FC = () => {
  const {
    flashcards, cardIdx, setCardIdx, flipped, setFlipped,
    cardsDone, setCardDone, remMiniQuiz, quizReveal, setQuizReveal,
    setPage, loading, topic, fileSummary, setFlashcards, setRemMiniQuiz, addHistory
  } = useStore()

  useEffect(() => {
    if (!flashcards.length && !loading) {
      const generate = async () => {
        let context = ''
        if (topic) context = `หัวข้อ: ${topic.th}`
        else if (fileSummary) context = `สรุปเนื้อหา: ${fileSummary.summary}`
        
        try {
          const result = await AIService.generateFlashcards(context)
          setFlashcards(result.flashcards)
          setRemMiniQuiz(result.miniQuiz)
        } catch (e) {
          console.error(e)
          alert(getReadableAIError(e, 'เกิดข้อผิดพลาดในการสร้าง Flashcard'))
        }
      }
      generate()
    }
  }, [flashcards.length, loading, topic, fileSummary, setFlashcards, setRemMiniQuiz])

  if (loading || !flashcards.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4" />
      <div className="text-sm font-medium">AI กำลังสร้าง Flashcard...</div>
    </div>
  )

  const idx = cardIdx
  const total = flashcards.length
  const card = flashcards[idx]
  const doneCount = Object.values(cardsDone).filter(Boolean).length

  const gradMap: Record<string, string> = {
    accent: 'from-red-800 to-red-400',
    blue: 'from-blue-800 to-blue-500',
    purple: 'from-purple-800 to-purple-500',
    teal: 'from-teal-800 to-teal-500',
    gold: 'from-amber-800 to-amber-500'
  }
  const grad = gradMap[card.color || 'accent'] || 'from-red-800 to-red-400'

  const handleFlip = () => setFlipped(!flipped)

  const handleNext = () => {
    if (idx < total - 1) setCardIdx(idx + 1)
  }

  const handlePrev = () => {
    if (idx > 0) setCardIdx(idx - 1)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-2.5 px-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          การ์ด {idx + 1}/{total} · จำได้ {doneCount}/{total}
        </div>
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden md:flex items-center gap-1.5">
          <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 font-sans text-[10px]">←</kbd>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 font-sans text-[10px]">→</kbd>
          <span>เลื่อน</span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 font-sans text-[10px]">Space</kbd>
          <span>พลิก</span>
        </div>
      </div>
      
      <div className="flex gap-1.5 mb-6">
        {flashcards.map((_, i) => (
          <div 
            key={i}
            onClick={() => setCardIdx(i)}
            className={clsx(
              "flex-1 h-1.5 rounded-full cursor-pointer transition-all duration-300",
              i === idx ? "bg-red-800 dark:bg-red-600 scale-y-125" : (cardsDone[i] ? "bg-green-600 dark:bg-green-500" : "bg-slate-200 dark:bg-slate-700")
            )}
          />
        ))}
      </div>

      <div className="relative h-72 md:h-80 mb-6 cursor-pointer select-none group" onClick={handleFlip}>
        <motion.div 
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div 
            className={clsx(
              "absolute inset-0 w-full h-full rounded-2xl p-0 flex flex-col overflow-hidden shadow-xl backface-hidden",
              `bg-gradient-to-br ${grad}`
            )}
          >
            <div className="p-4 px-6 flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-[1.5px]">{card.rule || 'CONCEPT'}</span>
              <div className="flex gap-2 items-center">
                {card.difficulty && (
                  <span className="text-[10px] bg-black/20 text-white px-2.5 py-1 rounded-full font-bold">
                    {card.difficulty === 'easy' ? 'ง่าย' : card.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                  </span>
                )}
                <RotateCw size={16} className="text-white/50" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 text-center">
              <div className="text-lg md:text-xl font-bold text-white leading-relaxed drop-shadow-md">
                <MathText text={card.front} />
              </div>
            </div>
            <div className="p-4 px-6 text-[11px] text-white/60 text-center font-medium">
              {card.hint ? (
                <span className="inline-flex items-center gap-1.5">
                  <Lightbulb size={12} />
                  {card.hint}
                </span>
              ) : 'แตะเพื่อดูคำตอบ'}
            </div>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-0 flex flex-col overflow-hidden shadow-xl backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">คำตอบ</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.rule || ''}</span>
            </div>
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="text-base md:text-lg font-bold text-red-800 dark:text-red-500 whitespace-pre-wrap font-sans leading-relaxed mb-5">
                <MathText text={card.back} />
              </div>
              {card.example && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 shadow-inner">
                  <div className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-1.5">ตัวอย่างประยุกต์</div>
                  <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    <MathText text={card.example} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={handlePrev}
          disabled={idx === 0}
          className="w-11 h-11 rounded-full flex items-center justify-center border-1.5 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        
        <AnimatePresence mode="wait">
          {flipped && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2.5"
            >
              <button 
                onClick={() => { setCardDone(idx, true); handleNext(); }}
                className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all shadow-sm active:scale-95"
              >
                <CheckCircle2 size={18} /> จำได้
              </button>
              <button 
                onClick={() => { setCardDone(idx, false); handleNext(); }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              >
                <RotateCcw size={18} /> ทบทวน
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleNext}
          disabled={idx === total - 1}
          className="w-11 h-11 rounded-full flex items-center justify-center border-1.5 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Mini Quiz Section */}
      {remMiniQuiz.length > 0 && (
        <div className="mt-10 animate-fade-in">
          <div className="serif text-[10px] tracking-[1.5px] text-slate-400 font-bold uppercase mb-4 border-l-2 border-red-800 pl-3">
            REMEDIAL QUIZ · 確認テスト
          </div>
          <div className="space-y-3">
            {remMiniQuiz.map((q: MiniQuizItem, i: number) => (
              <div key={i} className="card bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm">
                <div className="text-[13px] md:text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">
                  {i + 1}. <MathText text={q.question} />
                </div>
                {quizReveal[i] ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg p-3 px-4 text-[13px] text-green-700 dark:text-green-500 font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> <MathText text={q.answer} />
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setQuizReveal(i, true)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    ดูเฉลย
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-between items-center gap-4">
        <button 
          onClick={() => setPage('home')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        >
          <RotateCcw size={18} /> กลับหน้าแรก
        </button>
        <button
          onClick={() => {
            addHistory('flashcard', {
              topic: topic?.th || fileSummary?.title || 'Flashcard',
              score: doneCount,
              total,
            })
            setPage('mastery')
          }}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all"
        >
          ดูสรุปผล Mastery <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
