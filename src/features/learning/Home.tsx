import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/core/state/useStore'
import { useI18n } from '@/shared/hooks/useI18n'
import { TOPICS } from '@/features/learning/topics'
import {
  FileText,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Zap,
  Star,
  History,
  BarChart2,
  Bookmark,
  LayoutDashboard,
} from 'lucide-react'
import { Page } from '@/core/state/store.types'

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay },
  }),
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

// ─── Quick Action Card Definition ────────────────────────────────────────────

interface QuickAction {
  page: Page
  icon: React.ReactNode
  labelTh: string
  labelEn: string
  descTh: string
  descEn: string
  accent: string
  ariaLabelTh: string
  ariaLabelEn: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    page: 'file_upload',
    icon: <FileText size={22} />,
    labelTh: 'อัปโหลดไฟล์',
    labelEn: 'Upload File',
    descTh: 'วิเคราะห์เนื้อหาจาก PDF หรือรูปภาพ',
    descEn: 'Analyse content from PDF or images',
    accent: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    ariaLabelTh: 'ไปหน้าอัปโหลดไฟล์',
    ariaLabelEn: 'Go to file upload',
  },
  {
    page: 'topic_select',
    icon: <BookOpen size={22} />,
    labelTh: 'ควิซวัดระดับ',
    labelEn: 'Practice Quiz',
    descTh: 'เลือกหัวข้อและทำแบบทดสอบ',
    descEn: 'Pick a topic and start quizzing',
    accent: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    ariaLabelTh: 'ไปหน้าเลือกหัวข้อ',
    ariaLabelEn: 'Go to topic select',
  },
  {
    page: 'bookmarks',
    icon: <Bookmark size={22} />,
    labelTh: 'บุ๊กมาร์กของฉัน',
    labelEn: 'My Bookmarks',
    descTh: 'ดูคำถามที่บันทึกไว้ทั้งหมด',
    descEn: 'Review all your saved questions',
    accent: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    ariaLabelTh: 'ไปหน้าบุ๊กมาร์ก',
    ariaLabelEn: 'Go to bookmarks',
  },
  {
    page: 'mastery',
    icon: <LayoutDashboard size={22} />,
    labelTh: 'แดชบอร์ดความชำนาญ',
    labelEn: 'Mastery Dashboard',
    descTh: 'ติดตามความก้าวหน้าในแต่ละหัวข้อ',
    descEn: 'Track your progress by topic',
    accent: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400',
    ariaLabelTh: 'ไปหน้าความชำนาญ',
    ariaLabelEn: 'Go to mastery dashboard',
  },
]

// ─── Helper: icon for history type ───────────────────────────────────────────

const getHistoryIcon = (type: string) => {
  switch (type) {
    case 'file':      return <FileText className="text-blue-500" size={18} />
    case 'quiz':      return <BookOpen className="text-purple-500" size={18} />
    case 'exam':      return <Award className="text-amber-500" size={18} />
    case 'flashcard': return <Zap className="text-red-500" size={18} />
    case 'teachback': return <Star className="text-green-500" size={18} />
    default:          return <Clock className="text-slate-500" size={18} />
  }
}

const getHistoryPage = (type: string): Page | null => {
  switch (type) {
    case 'file':      return 'file_upload'
    case 'quiz':      return 'topic_select'
    case 'exam':      return 'mastery'
    case 'flashcard': return 'flashcards'
    case 'teachback': return 'mastery'
    default:          return null
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  const { t, lang } = useI18n()
  const { setPage, mastery, history, streak } = useStore()

  const overallMastery = Math.round(
    Object.values(mastery).reduce((a, b) => a + b, 0) / (Object.keys(mastery).length || 1)
  )

  const topicsMastered = TOPICS.filter((tp) => (mastery[tp.id] ?? 0) >= 70).length

  const recentHistory = history.slice(0, 5)

  const topicsInProgress = TOPICS.filter((tp) => (mastery[tp.id] ?? 0) > 0)

  // ── Stat cards config ──────────────────────────────────────────────────────
  const stats = [
    {
      label: lang === 'th' ? 'ความชำนาญโดยรวม' : 'Overall Mastery',
      value: `${overallMastery}%`,
      icon: <TrendingUp size={28} />,
      accent: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500',
      page: 'mastery' as Page,
      ariaLabel: lang === 'th' ? 'ดูหน้าความชำนาญ' : 'View mastery page',
    },
    {
      label: lang === 'th' ? 'วันติดต่อกัน' : 'Study Streak',
      value: `${streak} ${lang === 'th' ? 'วัน' : 'days'}`,
      icon: <Award size={28} />,
      accent: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500',
      page: 'mastery' as Page,
      ariaLabel: lang === 'th' ? 'ดูประวัติการเรียน' : 'View study history',
    },
    {
      label: lang === 'th' ? 'เซสชันทั้งหมด' : 'Total Sessions',
      value: `${history.length}`,
      icon: <Clock size={28} />,
      accent: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500',
      page: 'mastery' as Page,
      ariaLabel: lang === 'th' ? 'ดูประวัติเซสชัน' : 'View session history',
    },
    {
      label: lang === 'th' ? 'หัวข้อที่เชี่ยวชาญ' : 'Topics Mastered',
      value: `${topicsMastered}`,
      icon: <BarChart2 size={28} />,
      accent: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-500',
      page: 'mastery' as Page,
      ariaLabel: lang === 'th' ? 'ดูหัวข้อที่เชี่ยวชาญ' : 'View mastered topics',
    },
  ]

  return (
    <div className="space-y-10" role="main" aria-label={lang === 'th' ? 'หน้าหลัก' : 'Home Dashboard'}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 to-red-800 p-8 md:p-12 text-white shadow-2xl shadow-red-900/20"
        aria-labelledby="hero-heading"
      >
        <div className="relative z-10 max-w-lg">
          <h1
            id="hero-heading"
            className="serif text-3xl md:text-5xl font-black leading-tight mb-4"
          >
            {lang === 'th' ? (
              <>เปลี่ยนความผิดพลาด<br />ให้เป็นความเข้าใจ</>
            ) : (
              <>Turn Mistakes<br />into Mastery</>
            )}
          </h1>
          <p className="text-red-100/80 text-sm md:text-base leading-relaxed">
            {lang === 'th'
              ? 'วิเคราะห์จุดอ่อนรายบุคคลด้วย AI พร้อมระบบ Spaced Repetition ที่จะช่วยให้คุณจำเนื้อหาได้แม่นยำขึ้นถึง 40%'
              : 'AI-driven gap analysis combined with Spaced Repetition to boost your learning retention by 40%.'}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400/10 rounded-full -mr-32 -mb-32 blur-3xl pointer-events-none" aria-hidden="true" />
      </motion.section>

      {/* ── Quick Action Cards ───────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        aria-label={lang === 'th' ? 'การดำเนินการด่วน' : 'Quick Actions'}
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4"
        >
          {lang === 'th' ? 'เริ่มต้นด่วน' : 'Quick Start'}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.page}
              variants={fadeUp}
              custom={i * 0.05}
              onClick={() => setPage(action.page)}
              aria-label={lang === 'th' ? action.ariaLabelTh : action.ariaLabelEn}
              className="group flex flex-col items-start gap-3 p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-800/40 hover:shadow-md hover:shadow-red-900/5 transition-all duration-200 cursor-pointer min-h-[44px] text-left focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${action.accent}`}>
                {action.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {lang === 'th' ? action.labelTh : action.labelEn}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5">
                  {lang === 'th' ? action.descTh : action.descEn}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        aria-label={lang === 'th' ? 'สถิติการเรียน' : 'Learning Stats'}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.button
              key={s.label}
              variants={fadeUp}
              custom={i * 0.05}
              onClick={() => setPage(s.page)}
              aria-label={s.ariaLabel}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-800/40 hover:shadow-md hover:shadow-red-900/5 transition-all duration-200 cursor-pointer min-h-[44px] text-left focus:outline-none focus:ring-2 focus:ring-red-500/40 w-full"
            >
              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${s.accent}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">{s.label}</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">{s.value}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Progress by Topic ─────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="show"
        custom={0.15}
        variants={fadeUp}
        aria-labelledby="topic-progress-title"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            id="topic-progress-title"
            className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2"
          >
            <BarChart2 size={20} className="text-red-800 dark:text-red-500" aria-hidden="true" />
            {lang === 'th' ? 'ความคืบหน้าแต่ละหัวข้อ' : 'Progress by Topic'}
          </h2>
          <button
            onClick={() => setPage('mastery')}
            className="text-xs font-bold text-red-800 dark:text-red-500 hover:underline flex items-center gap-1 cursor-pointer focus:outline-none min-h-[44px] px-1"
            aria-label={lang === 'th' ? 'ดูความชำนาญทั้งหมด' : 'View all mastery'}
          >
            {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        {topicsInProgress.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-400 mb-4">
              {lang === 'th' ? 'ยังไม่มีหัวข้อที่เริ่มเรียน' : 'No topics started yet'}
            </p>
            <button
              onClick={() => setPage('topic_select')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-800 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500/40"
              aria-label={lang === 'th' ? 'ไปหน้าเลือกหัวข้อ' : 'Go to topic select'}
            >
              <BookOpen size={16} aria-hidden="true" />
              {lang === 'th' ? 'เริ่มเรียน' : 'Start Learning'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicsInProgress.slice(0, 10).map((tp, i) => {
              const score = mastery[tp.id] ?? 0
              const pct = Math.min(100, Math.max(0, score))
              const barColor =
                pct >= 70
                  ? 'bg-green-500'
                  : pct >= 40
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              return (
                <motion.button
                  key={tp.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onClick={() => setPage('mastery')}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-800/40 transition-all duration-200 cursor-pointer min-h-[44px] text-left w-full focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  aria-label={`${lang === 'th' ? tp.th : tp.id} — ${pct}%`}
                >
                  <span className="text-xl w-8 shrink-0 text-center" aria-hidden="true">{tp.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {lang === 'th' ? tp.th : tp.id.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2 shrink-0">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.section>

      {/* ── Recent Activity + Learning Science ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <motion.section
          initial="hidden"
          animate="show"
          custom={0.2}
          variants={fadeUp}
          aria-labelledby="recent-activity-title"
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              id="recent-activity-title"
              className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2"
            >
              <History size={20} className="text-red-800 dark:text-red-500" aria-hidden="true" />
              {lang === 'th' ? 'กิจกรรมล่าสุด' : 'Recent Activity'}
            </h2>
            <button
              onClick={() => setPage('mastery')}
              className="text-xs font-bold text-red-800 dark:text-red-500 hover:underline flex items-center gap-1 cursor-pointer focus:outline-none min-h-[44px] px-1"
              aria-label={lang === 'th' ? 'ดูประวัติทั้งหมด' : 'View all activity'}
            >
              {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentHistory.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-400">
                  {lang === 'th' ? 'ยังไม่มีประวัติกิจกรรม' : 'No recent activity yet'}
                </p>
              </div>
            ) : (
              recentHistory.map((h, i) => {
                const targetPage = getHistoryPage(h.type)
                const label =
                  h.type === 'file'
                    ? (h.data.title ?? h.data.fileName ?? 'File')
                    : h.type === 'quiz'
                    ? (h.data.topic ?? 'Quiz')
                    : h.type === 'exam'
                    ? `Exam: ${h.data.title ?? ''}`
                    : h.type === 'flashcard'
                    ? (lang === 'th' ? 'แฟลชการ์ด' : 'Flashcard Session')
                    : (lang === 'th' ? 'Teach-Back' : 'Teach-Back Session')

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05 }}
                    role={targetPage ? 'button' : undefined}
                    tabIndex={targetPage ? 0 : undefined}
                    onClick={targetPage ? () => setPage(targetPage) : undefined}
                    onKeyDown={
                      targetPage
                        ? (e) => { if (e.key === 'Enter' || e.key === ' ') setPage(targetPage) }
                        : undefined
                    }
                    aria-label={
                      targetPage
                        ? `${label} — ${lang === 'th' ? 'ไปที่หน้า' : 'go to page'} ${targetPage}`
                        : label
                    }
                    className={[
                      'flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800',
                      'hover:border-red-100 dark:hover:border-red-900/30 transition-all group',
                      targetPage ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/40' : '',
                    ].join(' ')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0" aria-hidden="true">
                      {getHistoryIcon(h.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{label}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {new Date(h.ts).toLocaleDateString(
                          lang === 'th' ? 'th-TH' : 'en-US',
                          { day: 'numeric', month: 'short', year: '2-digit' }
                        )}
                      </div>
                    </div>
                    {h.data.score !== undefined && (
                      <div
                        className="text-sm font-black text-red-800 dark:text-red-500 shrink-0"
                        aria-label={`Score: ${h.data.score} out of ${h.data.total ?? 10}`}
                      >
                        {h.data.score}/{h.data.total ?? 10}
                      </div>
                    )}
                    {targetPage && (
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-red-400 transition-colors" aria-hidden="true" />
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.section>

        {/* Learning Science */}
        <motion.section
          initial="hidden"
          animate="show"
          custom={0.25}
          variants={fadeUp}
          className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white relative overflow-hidden group"
          aria-labelledby="science-title"
        >
          <div className="relative z-10">
            <h2 id="science-title" className="text-xl font-black mb-6 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" aria-hidden="true" />
              Learning Science
            </h2>
            <div className="space-y-6">
              {[
                {
                  badge: '+28%',
                  title: 'Retrieval Practice',
                  bodyTh: 'การดึงข้อมูลออกจากความจำผ่านการทำข้อสอบ ช่วยสร้างเส้นใยประสาทที่แข็งแรงกว่าการแค่อ่าน',
                  bodyEn: 'Active recall through testing strengthens neural pathways more effectively than passive reading.',
                },
                {
                  badge: '+35%',
                  title: 'Self-Explanation',
                  bodyTh: 'ระบบ Teach-Back บังคับให้คุณต้องอธิบายเนื้อหาด้วยคำพูดตัวเอง ซึ่งเป็นวิธีเรียนรู้ที่ทรงพลังที่สุด',
                  bodyEn: 'Our Teach-Back system prompts you to explain concepts in your own words, a powerful learning technique.',
                },
                {
                  badge: '+40%',
                  title: 'Spaced Repetition',
                  bodyTh: 'การทบทวนในระยะเวลาที่เหมาะสม (1, 3, 7 วัน) ช่วยป้องกันการลืมข้อมูลอย่างถาวร',
                  bodyEn: 'Reviewing at optimal intervals (1, 3, 7 days) prevents forgetting and secures long-term memory.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0"
                    aria-label={`${lang === 'th' ? 'คะแนนพัฒนาการ' : 'Improvement'}: ${item.badge}`}
                  >
                    {item.badge}
                  </div>
                  <div>
                    <div className="text-sm font-bold mb-1">{item.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'th' ? item.bodyTh : item.bodyEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" aria-hidden="true">
            <BookOpen size={120} />
          </div>
        </motion.section>
      </div>
    </div>
  )
}
