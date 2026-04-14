import React from 'react'
import { useStore } from '@/core/state/useStore'
import { Topic } from '@/core/state/store.types'
import { TOPICS } from '../learning/topics'
import {
  ChevronLeft,
  Calendar,
  Download,
  Share2,
  Target,
  Flame,
  PieChart,
  Check,
} from 'lucide-react'
import { clsx } from 'clsx'

const buildReport = (mastery: Record<string, number>, history: { type: string; ts: number }[], streak: number) => {
  const overall = Math.round(Object.values(mastery).reduce((a, b) => a + b, 0) / (TOPICS.length || 1))
  const lines = [
    '== FlashFix AI — Mastery Report ==',
    `Generated: ${new Date().toLocaleString('th-TH')}`,
    `Streak: ${streak} days`,
    `Sessions: ${history.length}`,
    `Overall Mastery: ${overall}%`,
    '',
    '-- Topics --',
    ...TOPICS.map(t => `${t.th.padEnd(20)} ${(mastery[t.id] ?? 0)}%`),
  ]
  return lines.join('\n')
}

export const Mastery: React.FC = () => {
  const { mastery, setPage, history, streak } = useStore()
  const [copied, setCopied] = React.useState(false)

  const handleDownload = () => {
    const text = buildReport(mastery, history, streak)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flashfix-mastery-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const text = buildReport(mastery, history, streak)
    if (navigator.share) {
      await navigator.share({ title: 'FlashFix Mastery Report', text })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const overallMastery = Math.round(
    Object.values(mastery).reduce((a, b) => a + b, 0) / (TOPICS.length || 1)
  )

  // Simple Heatmap logic: group history by day
  const getHeatmapData = () => {
    const days = 14
    const data = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = history.filter(h => new Date(h.ts).toISOString().split('T')[0] === dateStr).length
      data.push({ date: dateStr, count })
    }
    return data
  }

  const heatmapData = getHeatmapData()

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Target size={12} /> Mastery Tracking
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">ความก้าวหน้าของคุณ</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">วิเคราะห์ทักษะและความแม่นยำในการเรียนรู้</p>
      </section>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * overallMastery) / 100}
                className="text-red-800 dark:text-red-600 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{overallMastery}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Overall</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">ความเชี่ยวชาญรวม</h3>
          <p className="text-xs text-slate-400 mt-1">อิงจากทุกหัวข้อที่คุณได้เรียนมา</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Flame size={20} className="text-orange-500" /> กิจกรรม 14 วันล่าสุด
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase">Activity Log</span>
          </div>
          <div className="flex gap-2 justify-between items-end h-32">
            {heatmapData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div 
                  className={clsx(
                    "w-full rounded-t-lg transition-all duration-500 cursor-help",
                    d.count === 0 ? "bg-slate-50 dark:bg-slate-800 h-2" : 
                    d.count < 3 ? "bg-red-200 dark:bg-red-900/30 h-1/3" :
                    d.count < 6 ? "bg-red-500 h-2/3" : "bg-red-800 h-full"
                  )}
                />
                <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {d.date}: {d.count} กิจกรรม
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>14 วันที่แล้ว</span>
            <span>วันนี้</span>
          </div>
        </div>
      </div>

      {/* Topics Breakdown */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart size={24} className="text-red-800 dark:text-red-500" /> แยกตามหัวข้อ
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              title="ดาวน์โหลดรายงาน"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleShare}
              title={copied ? 'คัดลอกแล้ว!' : 'แชร์หรือคัดลอก'}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPICS.map((t: Topic) => {
            const score = mastery[t.id] || 0
            return (
              <div 
                key={t.id}
                className="group bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl font-serif font-black text-red-800 dark:text-red-500 group-hover:scale-110 transition-transform">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.th}</span>
                      <span className={clsx(
                        "text-sm font-black",
                        score >= 70 ? "text-green-600" : "text-red-800 dark:text-red-500"
                      )}>{score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full transition-all duration-1000 delay-300",
                          score >= 70 ? "bg-green-600" : "bg-red-800 dark:bg-red-600"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Spaced Repetition Card */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shrink-0">
            <Calendar size={34} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black mb-2">Spaced Repetition Scheduler</h3>
            <p className="text-sm text-blue-100/70 leading-relaxed mb-6">
              ระบบจะคำนวณช่วงเวลาที่เหมาะสมที่สุดในการทบทวน เพื่อย้ายข้อมูลจากความจำระยะสั้นไปยังความจำระยะยาว
            </p>
            <button
              onClick={() => setPage('topic_select')}
              className="px-8 py-3 bg-white text-blue-900 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 mx-auto md:mx-0 shadow-lg shadow-black/20"
            >
              ทบทวนหัวข้อตอนนี้ <Calendar size={18} />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />
      </section>

      <div className="flex justify-center pt-4">
        <button 
          onClick={() => setPage('home')}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <ChevronLeft size={18} /> กลับสู่หน้าหลัก
        </button>
      </div>
    </div>
  )
}
