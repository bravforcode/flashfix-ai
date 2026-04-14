import React from 'react'
import { useStore } from '@/core/state/useStore'
import { BrainCircuit, FileText, Lightbulb, Loader2, Sparkles } from 'lucide-react'

export const FileProcessing: React.FC = () => {
  const { fileName } = useStore()
  const steps = [
    { label: 'อ่านไฟล์...', icon: FileText },
    { label: 'วิเคราะห์เนื้อหา...', icon: BrainCircuit },
    { label: 'สร้างข้อสอบ 5 ข้อ...', icon: Lightbulb },
  ]

  return (
    <div className="animate-fade-in py-2">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mb-4 inline-flex items-center justify-center rounded-2xl bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-500 animate-pulse">
          <Sparkles size={30} />
        </div>
        <div className="serif text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          AI กำลังวิเคราะห์ไฟล์
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {fileName}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map(({ label, icon: StepIcon }, i) => (
          <div 
            key={label} 
            className="flex items-center gap-3.5 p-3.5 px-4.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <StepIcon size={16} className="text-red-800 dark:text-red-500" />
            </div>
            <div className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{label}</div>
            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-800/20 dark:bg-red-500/20 w-full animate-shimmer" />
            </div>
            <Loader2 size={16} className="text-red-800 dark:text-red-500 animate-spin" />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="flex justify-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-800 animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-red-800 animate-bounce delay-75" />
          <span className="w-2 h-2 rounded-full bg-red-800 animate-bounce delay-150" />
        </div>
        <div className="text-xs text-slate-400">ระบบกำลังประมวลผลบทเรียน...</div>
      </div>
    </div>
  )
}
