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
    const searchInput = this.container.querySelector('#search-input')
    const searchBtn = this.container.querySelector('#search-btn')
    const aiInput = this.container.querySelector('#ai-input')
    const aiBtn = this.container.querySelector('#ai-btn')

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.search()
    })
    searchBtn.addEventListener('click', () => this.search())

    aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendToAI()
    })
    aiBtn.addEventListener('click', () => this.sendToAI())

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
    this.loading = true
    this.updateUI()
    
    try {
      // Mock API call to your backend
      const response = await fetch('/api/search?q=' + encodeURIComponent(this.query))
      const data = await response.json()
      this.results = data.hits || Array.from({length: 8}, (_, i) => ({
        id: i,
        file: `intel_doc_${Date.now()}_${i}.txt`,
        content: `Found: user${i}@gmail.com | +1-555-01${i}234 | High confidence credential match`,
        score: 0.87 + Math.random() * 0.13
      }))
    } catch (error) {
      console.error('Search error:', error)
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
        <h1 class="text-6xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Telegram AI Intel
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto animate-entrance">
          Magnetic search interface powered by your Telegram intel bot
        </p>
      </header>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Search -->
        <div class="space-y-8">
          <div class="relative">
            <input id="search-input" type="text" placeholder="🔍 email password phone crypto..." 
              class="w-full p-8 text-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl text-white placeholder-gray-400">
            <button id="search-btn" class="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300">
              Search Intel
            </button>
          </div>

          ${this.results.length ? `
            <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 class="text-3xl font-bold text-white mb-8 flex items-center">
                📊 ${this.results.length} Intel Matches
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
                ${this.results.map(r => `
                  <div class="magnetic-card group bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl p-6 rounded-2xl border border-white/20 hover:border-white/50 hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer transition-all duration-500 hover:scale-[1.02]">
                    <h3 class="text-xl font-bold text-white mb-3">${r.file}</h3>
                    <p class="text-gray-200 text-sm line-clamp-3 mb-4">${r.content}</p>
                    <div class="flex justify-between items-center">
                      <span class="text-xs opacity-75">Score</span>
                      <span class="font-bold text-green-400 text-lg">${(r.score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- AI Chat -->
        <div class="space-y-6">
          <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 class="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              🤖 AI Intel Analyst
              <span class="px-4 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-400/30">
                Live
              </span>
            </h2>
            
            <div class="space-y-4 mb-8 max-h-80 overflow-y-auto bg-black/20 rounded-2xl p-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              ${this.chatMessages.map(msg => `
                <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                  <div class="max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/10 text-white border border-white/20'}">
                    ${msg.content.replace(/\n/g, '<br>')}
                  </div>
                </div>
              `).join('')}
              ${this.loading ? `
                <div class="flex justify-start">
                  <div class="bg-white/10 text-white border border-white/20 p-4 rounded-2xl animate-pulse">
                    🔄 AI analyzing intelligence data...
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="flex gap-3">
              <input id="ai-input" type="text" placeholder="Ask AI: 'extract emails' or 'risk analysis'..." 
                class="flex-1 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/50 text-white placeholder-gray-400">
              <button id="ai-btn" class="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 whitespace-nowrap">
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

