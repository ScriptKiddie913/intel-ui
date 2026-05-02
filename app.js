class TelegramSearchApp {
  constructor() {
    this.query = ''
    this.results = []
    this.chatMessages = []
    this.loading = false
    this.container = document.getElementById('root')
    this.init()
  }

  init() {
    this.render()
    this.bindEvents()
    this.animateEntrance()
  }

  bindEvents() {
    this.searchInput = this.container.querySelector('#search-input')
    this.searchBtn = this.container.querySelector('#search-btn')
    this.aiInput = this.container.querySelector('#ai-input')
    this.aiBtn = this.container.querySelector('#ai-btn')

    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.search()
    })
    this.searchBtn.addEventListener('click', () => this.search())

    this.aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendToAI()
    })
    this.aiBtn.addEventListener('click', () => this.sendToAI())

    // Magnetic mouse tracking
    document.addEventListener('mousemove', this.magneticMove.bind(this))
  }

  magneticMove(e) {
    const cards = this.container.querySelectorAll('.magnetic-card')
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const rotateX = y / 20
      const rotateY = -x / 20
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    })
  }

  async search() {
    this.query = (this.searchInput?.value || this.query || '').trim()
    if (!this.query) return

    this.loading = true
    this.updateUI()
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: this.query, limit: 80 })
      })
      const data = await response.json()
      this.results = Array.isArray(data.messages) ? data.messages : []
    } catch (error) {
      console.error('Search error:', error)
      this.results = []
    }
    
    this.loading = false
    this.updateUI()
  }

  async sendToAI() {
    if (!this.aiInput.value.trim()) return
    
    const userMsg = { role: 'user', content: this.aiInput.value }
    this.chatMessages.push(userMsg)
    
    this.loading = true
    this.updateUI()
    
    // Mock AI response
    setTimeout(() => {
      this.chatMessages.push({
        role: 'assistant', 
        content: `## AI Analysis Report\n\n**Query:** ${userMsg.content}\n**Results:** ${this.results.length} matches\n\n**Key Findings:**\n• 8 high-confidence credentials\n• Risk score: 92%\n• Primary domain: gmail.com`
      })
      this.loading = false
      this.aiInput.value = ''
      this.updateUI()
    }, 1500)
  }

  animateEntrance() {
    const elements = this.container.querySelectorAll('.animate-entrance')
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`
      el.classList.add('animate-slide-up')
    })
  }

  updateUI() {
    this.render()
  }

  render() {
    this.container.innerHTML = `
      <header class="text-center mb-16 animate-entrance">
        <h1 class="text-6xl font-black bg-gradient-to-r from-sky-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Telegram AI Intel
        </h1>
        <p class="text-xl text-slate-300 max-w-2xl mx-auto animate-entrance">
          Magnetic search interface powered by your Telegram intel bot
        </p>
      </header>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Search -->
        <div class="space-y-8">
          <div class="relative">
            <input id="search-input" type="text" value="${this.query.replace(/"/g, '&quot;')}" placeholder="🔍 email password phone crypto..." 
              class="w-full p-8 text-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-3xl focus:outline-none focus:ring-4 focus:ring-sky-400/30 shadow-2xl text-slate-100 placeholder-slate-400">
            <button id="search-btn" class="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-10 py-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-sky-500/30 hover:scale-105 transition-all duration-300">
              Search Intel
            </button>
          </div>

          ${this.results.length ? `
            <div class="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/60">
              <h2 class="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
                📊 ${this.results.length} Related Tag Matches
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
                ${this.results.map(r => `
                  <div class="magnetic-card group bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/70 hover:border-sky-400/40 hover:shadow-2xl hover:shadow-sky-500/20 cursor-pointer transition-all duration-500 hover:scale-[1.02]">
                    <div class="flex items-start justify-between gap-4 mb-3">
                      <h3 class="text-lg font-bold text-slate-100 leading-snug">${String(r.text || '').slice(0, 120) || 'Matched Telegram message'}</h3>
                      <span class="shrink-0 text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-200 border border-sky-400/25">
                        ${(Number(r.relevance) || 0).toFixed(0)}%
                      </span>
                    </div>
                    <p class="text-slate-300 text-sm line-clamp-3 mb-4">${r.text || ''}</p>
                    <div class="flex flex-wrap gap-2 mb-4 text-xs">
                      <span class="px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${r.category || 'other'}</span>
                      <span class="px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${r.location || 'unknown'}</span>
                      ${(r.keywords || []).slice(0, 3).map(tag => `<span class="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-400/20">${tag}</span>`).join('')}
                    </div>
                    <div class="flex justify-between items-center text-xs text-slate-400">
                      <span>${r.date || 'unknown date'}</span>
                      <span>${(r.entities || []).slice(0, 2).join(', ') || 'no entities'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- AI Chat -->
        <div class="space-y-6">
          <div class="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/60">
            <h2 class="text-3xl font-bold text-slate-100 mb-6 flex items-center gap-3">
              🤖 AI Intel Analyst
              <span class="px-4 py-1 bg-cyan-500/15 text-cyan-300 rounded-full text-sm font-semibold border border-cyan-400/30">
                Live
              </span>
            </h2>
            
            <div class="space-y-4 mb-8 max-h-80 overflow-y-auto bg-slate-950/50 rounded-2xl p-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              ${this.chatMessages.map(msg => `
                <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                  <div class="max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white' : 'bg-slate-800/80 text-slate-100 border border-slate-700/70'}">
                    ${msg.content.replace(/\n/g, '<br>')}
                  </div>
                </div>
              `).join('')}
              ${this.loading ? `
                <div class="flex justify-start">
                  <div class="bg-slate-800/80 text-slate-100 border border-slate-700/70 p-4 rounded-2xl animate-pulse">
                    🔄 AI analyzing intelligence data...
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="flex gap-3">
              <input id="ai-input" type="text" placeholder="Ask AI: 'extract emails' or 'risk analysis'..." 
                class="flex-1 p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-400/30 text-slate-100 placeholder-slate-400">
              <button id="ai-btn" class="px-10 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300 whitespace-nowrap">
                Analyze →
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Re-bind events after render
    this.bindEvents()
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new TelegramSearchApp()
})

// CSS-in-JS animations
const style = document.createElement('style')
style.textContent = `
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thumb-white\\/20 {
    background: rgba(255,255,255,0.2);
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slide-up 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`
document.head.appendChild(style)

