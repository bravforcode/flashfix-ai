import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathProps {
  formula: string
  block?: boolean
}

export const MathRenderer: React.FC<MathProps> = ({ formula, block = false }) => {
  try {
    const html = katex.renderToString(formula, {
      displayMode: block,
      throwOnError: false,
    })
    // KaTeX output is generally safe, but we can still sanitize if needed.
    // However, KaTeX's renderToString is designed for SSR/client and produces safe HTML.
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  } catch (error) {
    console.error('KaTeX error:', error)
    return <code>{formula}</code>
  }
}

export const MathText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null

  // Split text by $$...$$ and $...$
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2)
          return <div key={i} className="my-4 overflow-x-auto"><MathRenderer formula={formula} block /></div>
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1)
          return <MathRenderer key={i} formula={formula} />
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      })}
    </>
  )
}
