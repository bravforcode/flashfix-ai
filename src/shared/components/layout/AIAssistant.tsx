import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '@/core/state/useStore'
import { AIService } from '@/core/api/ai'
import { getReadableAIError } from '@/core/api/ai-errors'
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { MathText } from '../math/MathText'

export const AIAssistant: React.FC = () => {
  const { chatMessages, addChatMessage, clearChat, topic } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isOpen, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) {
      return
    }

    const userMessage = { role: 'user' as const, content: input.trim(), ts: Date.now() }
    addChatMessage(userMessage)
    setInput('')
    setIsTyping(true)

    try {
      const systemPrompt = `คุณคือ FlashFix AI Assistant ผู้ช่วยส่วนตัวในการเรียนรู้ หน้าที่ของคุณคือตอบคำถามนักเรียนเกี่ยวกับหัวข้อ "${topic?.th || 'ทั่วไป'}" อย่างใจดีและมีเหตุผล

กฎการตอบ:
1. ตอบเป็นภาษาไทยที่สุภาพและเป็นกันเอง
2. ถ้าเป็นวิชาคำนวณ ให้ใช้ LaTeX (เช่น $x^2$)
3. อธิบายแบบ Step-by-Step
4. ถ้าไม่รู้คำตอบ ให้บอกตรงๆ และแนะนำหัวข้อที่เกี่ยวข้อง
5. สรุป actionable takeaway สั้นๆ ตอนท้ายเสมอ`

      const { z } = await import('zod')
      const ChatResponseSchema = z.object({ response: z.string() })
      const result = await AIService.callAI(systemPrompt, input.trim(), ChatResponseSchema)

      addChatMessage({ role: 'assistant' as const, content: result.response, ts: Date.now() })
    } catch (error) {
      addChatMessage({
        role: 'assistant' as const,
        content: getReadableAIError(error, 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI'),
        ts: Date.now(),
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40">
      {isOpen && (
        <div
          id="ai-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-assistant-title"
          className="absolute bottom-16 md:bottom-[4.5rem] right-0 w-[min(24rem,calc(100vw-2rem))] h-[min(34rem,calc(100vh-8rem))] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-in"
        >
          <div className="p-4 bg-red-800 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={22} />
              </div>
              <div>
                <div id="ai-assistant-title" className="text-sm font-black">FlashFix Assistant</div>
                <div className="text-[10px] flex items-center gap-1 opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> พร้อมช่วยอธิบาย
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="ล้างแชท"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="ปิดผู้ช่วย AI"
              >
                <ChevronDown size={22} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <Sparkles size={40} className="mb-4 text-red-800 dark:text-red-500" />
                <div className="text-sm font-bold text-slate-500">ถามเสริมเกี่ยวกับบทเรียนนี้ได้ทันที</div>
                <p className="text-xs text-slate-400 mt-2">เช่น ขออธิบายละเอียดขึ้น ขอตัวอย่างเพิ่ม หรือให้เปรียบเทียบวิธีคิด</p>
              </div>
            )}

            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={clsx(
                  'flex items-start gap-2.5 max-w-[85%]',
                  message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.role === 'user'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    : 'bg-red-800 text-white'
                )}>
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={clsx(
                  'p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                  message.role === 'user'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-none'
                    : 'bg-red-50 dark:bg-red-900/20 text-slate-900 dark:text-slate-100 border border-red-100 dark:border-red-900/30 rounded-tl-none'
                )}>
                  <MathText text={message.content} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-3.5 bg-red-50 dark:bg-red-900/20 rounded-2xl rounded-tl-none border border-red-100 dark:border-red-900/30">
                  <Loader2 size={16} className="animate-spin text-red-800 dark:text-red-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSend()
                  }
                }}
                placeholder="ถามเพิ่มเกี่ยวกับบทเรียน..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isTyping}
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md',
                  input.trim() && !isTyping
                    ? 'bg-red-800 text-white shadow-red-900/20'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 shadow-none'
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90',
          isOpen ? 'bg-white text-slate-900 rotate-90' : 'bg-red-800 text-white hover:scale-110'
        )}
        aria-expanded={isOpen}
        aria-controls="ai-assistant-panel"
        aria-label={isOpen ? 'ปิดผู้ช่วย AI' : 'เปิดผู้ช่วย AI'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
