import React, { useEffect, useState } from 'react'
import { useStore } from '@/core/state/useStore'
import { X, Settings, ShieldCheck, HelpCircle, Save } from 'lucide-react'
import { Provider } from '@/core/state/store.types'

export const ApiSettingsModal: React.FC = () => {
  const {
    provider,
    apiKey,
    setApiConfig,
    isApiSettingsOpen,
    closeApiSettings,
  } = useStore()

  const [localProvider, setLocalProvider] = useState<Provider>(provider)
  const [localKey, setLocalKey] = useState(apiKey)

  useEffect(() => {
    if (!isApiSettingsOpen) {
      return
    }

    setLocalProvider(provider)
    setLocalKey(apiKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeApiSettings()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [apiKey, closeApiSettings, isApiSettingsOpen, provider])

  if (!isApiSettingsOpen) {
    return null
  }

  const requiresKey = localProvider !== 'local' && localProvider !== 'anthropic' && localProvider !== 'ollama'

  const handleSave = () => {
    setApiConfig(localProvider, requiresKey ? localKey.trim() : '')
    closeApiSettings()
  }

  return (
    <div
      className="fixed inset-0 z-[9000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-5"
      onClick={closeApiSettings}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-settings-title"
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-7 md:p-8 max-w-md w-full animate-scale-in shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <Settings size={20} className="text-red-800 dark:text-red-500" />
            <div id="api-settings-title" className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              ตั้งค่า AI
            </div>
          </div>
          <button
            type="button"
            onClick={closeApiSettings}
            className="bg-transparent border-none cursor-pointer p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            aria-label="ปิดหน้าต่างตั้งค่า AI"
          >
            <X size={22} />
          </button>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 mb-6 flex gap-3.5">
          <HelpCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs md:text-[13px] text-blue-900/80 dark:text-blue-300/80 font-medium leading-relaxed">
            ค่าเริ่มต้นที่แนะนำคือ `FlashFix Local` ซึ่งใช้ฟรีและใช้งานได้ทันทีโดยไม่ต้องมี key หรือ model ภายนอก
            ถ้าต้องการคำตอบที่ยืดหยุ่นขึ้นค่อยสลับไป `Ollama` หรือ provider ภายนอกภายหลัง
          </div>
        </div>

        <div className="space-y-5 mb-8">
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
              AI Provider
            </label>
            <select
              value={localProvider}
              onChange={(event) => setLocalProvider(event.target.value as Provider)}
              className="w-full p-3.5 border-1.5 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-red-800 dark:focus:border-red-600 transition-all cursor-pointer shadow-sm"
            >
              <option value="local">FlashFix Local (free/offline, recommended)</option>
              <option value="ollama">Ollama (local model)</option>
              <option value="anthropic">Anthropic Claude (built-in)</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
            </select>
          </div>

          {requiresKey && (
            <div className="animate-fade-up">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
                API Key
              </label>
              <input
                type="password"
                value={localKey}
                onChange={(event) => setLocalKey(event.target.value)}
                placeholder="sk-... หรือ AIzaSy..."
                className="w-full p-3.5 border-1.5 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-red-800 dark:focus:border-red-600 transition-all shadow-inner"
              />
              <div className="mt-3 flex items-center gap-1.5 px-1">
                <ShieldCheck size={12} className="text-slate-400" />
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Key นี้จะอยู่ในหน่วยความจำของ session ปัจจุบันเท่านั้น
                </div>
              </div>
            </div>
          )}

          {localProvider === 'local' && (
            <div className="animate-fade-up rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/70 dark:bg-emerald-900/10 p-4 text-xs md:text-[13px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
              โหมดนี้สร้าง quiz, feedback, flashcards และ summary แบบ deterministic ในตัวแอป
              ใช้ได้ทันทีแม้ไม่มี internet หรือ API key
            </div>
          )}

          {localProvider === 'ollama' && (
            <div className="animate-fade-up rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/70 dark:bg-emerald-900/10 p-4 text-xs md:text-[13px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
              ใช้ฟรีบนเครื่องของคุณเองผ่าน `http://127.0.0.1:11434` โดยค่าเริ่มต้น
              ถ้ายังไม่ได้ติดตั้ง ให้ติดตั้ง Ollama แล้ว pull โมเดลเช่น `qwen2.5:7b-instruct`
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={requiresKey && !localKey.trim()}
          className="btn-p bg-red-800 dark:bg-red-700 text-white w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 hover:bg-red-900 dark:hover:bg-red-600 transition-all shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          บันทึกการตั้งค่า <Save size={18} />
        </button>
      </div>
    </div>
  )
}
