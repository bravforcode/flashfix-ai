import React from 'react'
import { useStore } from '@/core/state/useStore'
import { Shield, ArrowRight } from 'lucide-react'

export const PdpaBanner: React.FC = () => {
  const { pdpaAccepted, acceptPdpa, onboardingSeen } = useStore()

  if (pdpaAccepted || !onboardingSeen) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-up">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-5 md:gap-8">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
          <Shield className="text-red-800 dark:text-red-500" size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">การคุ้มครองข้อมูลส่วนบุคคล (PDPA)</h4>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            เราเก็บเฉพาะข้อมูลที่จำเป็นต่อประสบการณ์การเรียนรู้ เช่น ประวัติการเรียนและการตั้งค่าภายในแอป
            โดยโหมด Local ของระบบไม่ต้องใช้ key เลย ส่วน key ของ OpenAI หรือ Gemini จะอยู่เฉพาะใน session ปัจจุบันเท่านั้น และโหมด built-in ของ Anthropic จะวิ่งผ่าน server-side configuration
          </p>
        </div>
        <button 
          onClick={acceptPdpa}
          className="btn-p bg-red-800 dark:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-900 dark:hover:bg-red-600 transition-all shadow-lg shadow-red-900/20 active:scale-95 whitespace-nowrap"
        >
          ยอมรับและใช้งาน <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
