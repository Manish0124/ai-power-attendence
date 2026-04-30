import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { Bot, Send, User, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import styles from './AIAssistantPage.module.css'

const SUGGESTIONS = [
  'Who came late today?',
  'Show employees with less than 8 hours',
  'How many overtime requests are pending?',
  'Give me an attendance summary',
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI attendance assistant 🤖 Ask me anything about attendance, overtime, or team activity.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const query = text || input.trim()
    if (!query) return

    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/ai/query', { query })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.status === 503
              ? '⚠️ AI Assistant is not configured. Please set your GEMINI_API_KEY in the backend .env file.'
              : '❌ Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="animate-fadeInUp" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={styles.aiIcon}><Bot size={24} /></div>
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-subtitle">Powered by Google Gemini</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>
            <Sparkles size={12} /> {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className={`card ${styles.chatBox}`}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
            <div className={styles.msgAvatar}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={styles.msgContent}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}<br /></span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.msg} ${styles.aiMsg}`}>
            <div className={styles.msgAvatar}><Bot size={16} /></div>
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`glass ${styles.inputRow}`}>
        <textarea
          className={styles.chatInput}
          placeholder="Ask about attendance, overtime, late arrivals…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className={`btn btn-primary ${styles.sendBtn}`}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
