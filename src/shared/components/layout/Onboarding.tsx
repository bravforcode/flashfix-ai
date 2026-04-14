import React, { useState } from 'react'
import { useStore } from '@/core/state/useStore'
import { ChevronRight, ChevronLeft, Check, Rocket, Brain, Target, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

const STEPS = [
  {
    title: 'ยินดีต้อนรับสู่ FlashFix AI',
    desc: 'ระบบช่วยจำที่เปลี่ยน "ความผิดพลาด" ให้เป็น "ความเข้าใจ" ด้วยพลังของ AI และวิทยาศาสตร์การเรียนรู้',
    icon: <Rocket size={40} className="text-red-800 dark:text-red-500" />,
    color: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    title: 'เรียนรู้จากข้อผิดพลาด',
    desc: 'AI จะวิเคราะห์ว่าคุณผิดตรงไหน อธิบายกฎที่ถูกต้อง และให้คุณลอง Teach-Back เพื่อยืนยันความเข้าใจ',
    icon: <Brain size={40} className="text-blue-800 dark:text-blue-500" />,
    color: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'จำได้แม่นด้วย Spaced Repetition',
    desc: 'สร้าง Flashcard อัตโนมัติจากเนื้อหาที่คุณเรียน และตั้งตารางทบทวนในเวลาที่เหมาะสมที่สุด',
    icon: <Target size={40} className="text-purple-800 dark:text-purple-500" />,
    color: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    title: 'พร้อมเริ่มกันเลย!',
    desc: 'อัปโหลดไฟล์เอกสาร หรือเลือกหัวข้อคณิตศาสตร์เพื่อเริ่มการเรียนรู้แบบใหม่ได้ทันที',
    icon: <Sparkles size={40} className="text-amber-600 dark:text-amber-500" />,
    color: 'bg-amber-50 dark:bg-amber-900/20'
  }
]

export const Onboarding: React.FC = () => {
  const { onboardingSeen, setOnboardingSeen } = useStore()
  const [step, setStep] = useState(0)

  if (onboardingSeen) return null

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else setOnboardingSeen(true)
  }

  const handlePrev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="fixed inset-0 z-[11000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl overflow-hidden relative"
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-red-800 dark:bg-red-500" : "w-1.5 bg-slate-200 dark:bg-slate-800"
                )} 
              />
            ))}
          </div>
          <button 
            onClick={() => setOnboardingSeen(true)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest"
          >
            Skip
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center md:text-left"
          >
            <div className={clsx("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto md:mx-0", STEPS[step].color)}>
              {STEPS[step].icon}
            </div>
            <h3 className="serif text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              {STEPS[step].title}
            </h3>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed md:leading-loose mb-10">
              {STEPS[step].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={20} /> ย้อนกลับ
          </button>
          <button 
            onClick={handleNext}
            className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-red-900 dark:hover:bg-red-600 transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            {step === STEPS.length - 1 ? (
              <><Check size={18} /> เริ่มใช้งานเลย</>
            ) : (
              <><ChevronRight size={18} /> ถัดไป</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
