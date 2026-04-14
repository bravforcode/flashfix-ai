import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/core/state/useStore'
import { useKeyboardNavigation } from '@/core/hooks/useKeyboardNavigation'
import { Navbar } from '@/shared/components/layout/Navbar'
import { PdpaBanner } from '@/shared/components/layout/PdpaBanner'
import { Onboarding } from '@/shared/components/layout/Onboarding'
import ErrorBoundary from '@/core/logging/ErrorBoundary'
import { LearningHistoryDrawer } from '@/shared/components/layout/LearningHistoryDrawer'
import { Home } from '@/features/learning/Home'
import { FileUpload } from '@/features/file-processing/FileUpload'
import { FileProcessing } from '@/features/file-processing/FileProcessing'
import { FileSummary } from '@/features/file-processing/FileSummary'
import { ExamMC } from '@/features/learning/ExamMC'
import { ExamResult } from '@/features/learning/ExamResult'
import { TopicSelect } from '@/features/learning/TopicSelect'
import { Quiz } from '@/features/learning/Quiz'
import { Solution } from '@/features/learning/Solution'
import { TeachBack } from '@/features/learning/TeachBack'
import { Flashcards } from '@/features/flashcards/Flashcards'
import { Mastery } from '@/features/mastery/Mastery'
import { Bookmarks } from '@/features/learning/Bookmarks'
import { ApiSettingsModal } from '@/features/settings/ApiSettingsModal'
import { AIAssistant } from '@/shared/components/layout/AIAssistant'

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const App: React.FC = () => {
  const page = useStore(state => state.page)
  const theme = useStore(state => state.theme)
  const initTheme = useStore(state => state.initTheme)

  useKeyboardNavigation()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const renderPage = () => {
    switch (page) {
      case 'home':            return <Home />
      case 'file_upload':     return <FileUpload />
      case 'file_processing': return <FileProcessing />
      case 'file_summary':    return <FileSummary />
      case 'exam_mc':         return <ExamMC />
      case 'exam_result':     return <ExamResult />
      case 'topic_select':    return <TopicSelect />
      case 'quiz':            return <Quiz />
      case 'solution':        return <Solution />
      case 'teach_back':      return <TeachBack />
      case 'flashcards':      return <Flashcards />
      case 'mastery':         return <Mastery />
      case 'bookmarks':       return <Bookmarks />
      default:                return <Home />
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950`}>
      <Navbar />

      {/* Full-screen main — no max-width card wrapper */}
      <main className="px-4 sm:px-6 md:px-10 xl:px-16 py-6 pb-28 md:pb-10">
        <ErrorBoundary>
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            {renderPage()}
          </motion.div>
        </ErrorBoundary>
      </main>

      <ApiSettingsModal />
      <LearningHistoryDrawer />
      <PdpaBanner />
      <Onboarding />
      <AIAssistant />
    </div>
  )
}

export default App
