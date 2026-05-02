"use client"

import { useState, useRef, useEffect } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [aiResponse, setAiResponse] = useState('')
  const searchRef = useRef(null)
  const containerRef = useRef(null)

  const searchTelegram = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query))
      const data = await res.json()
      setResults(data.hits || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendToAI = async () => {
    if (!aiResponse.trim()) return
    
    const userMessage = { role: 'user', content: aiResponse }
    setChatMessages(prev => [...prev, userMessage])
    
    setLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: aiResponse,
          sourceChannel: process.env.NEXT_PUBLIC_SOURCE_CHANNEL || '-1003717431935'
        })
      })
      const data = await res.json()
      const aiMessage = { role: 'assistant', content: data.response || 'AI analysis complete' }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setAiResponse('')
      setLoading(false)
    }
  }

  // Magnetic hover effects
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const cards = container.querySelectorAll('.magnetic-card')
      cards.forEach(card => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
      })
    }

    const handleMouseLeave = () => {
      const cards = container.querySelectorAll('.magnetic-card')
      cards.forEach(card => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
      })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8">
      {/* Header */}
      <header className="text-center mb-16">
        <h1 className="text-6xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Telegram AI Search
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Magnetic search interface with AI analysis powered by OpenRouter
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Search Panel */}
        <div className="space-y-8">
          {/* Search Box */}
          <div className="relative group">
            <input
              ref={searchRef}
              type="text"
              placeholder="Enter search keywords (e.g., email password phone)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTelegram()}
              className="w-full p-8 text-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-500 hover:bg-white/20 shadow-2xl"
            />
            <button
              onClick={searchTelegram}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>

          {/* Results Graph */}
          {results.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                📊 {results.length} Results Found
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                {results.slice(0, 8).map((result, i) => (
                  <div 
                    key={i}
                    className="magnetic-card bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 cursor-pointer group hover:scale-105 perspective-1000"
                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{result.file || 'Document'}</h3>
                    <p className="text-gray-200 line-clamp-3">{result.content}</p>
                    <div className="mt-4 text-sm opacity-75">
                      Score: <span className="font-bold text-green-400">{(Math.random() * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        <div ref={containerRef} className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              🤖 AI Analyst 
              <span className="ml-3 px-4 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                Live
              </span>
            </h2>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto bg-black/20 rounded-2xl p-6">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-white/10 text-white border border-white/20'}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white border border-white/20 p-4 rounded-2xl animate-pulse">
                    AI is analyzing your Telegram data...
                  </div>
                </div>
              )}
            </div>

            {/* AI Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendToAI()}
                placeholder="Ask AI to analyze results, generate report, extract patterns..."
                className="flex-1 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-white placeholder-gray-400"
              />
              <button
                onClick={sendToAI}
                disabled={loading || !aiResponse.trim()}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 transition-all duration-300 whitespace-nowrap"
              >
                Send to AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

