"use client"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-8">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-8 drop-shadow-2xl animate-pulse">
          Telegram AI Search
        </h1>
        <p className="text-2xl md:text-3xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto opacity-90">
          Advanced search with magnetic UI, live AI analysis, 
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-semibold">
            real-time graphs & tilting cards
          </span>
        </p>
        <a 
          href="/search"
          className="inline-block bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-600 text-white px-12 py-8 rounded-3xl text-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-500 hover:-rotate-3 transform-gpu group relative overflow-hidden"
        >
          <span className="relative z-10">🚀 Launch Search</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </a>
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto opacity-80">
          <div className="magnetic-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-500 group hover:-rotate-1">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-3">Instant Search</h3>
            <p className="text-gray-300">Real-time Telegram file search across all indexed documents</p>
          </div>
          <div className="magnetic-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-500 group hover:rotate-1">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-white mb-3">AI Analyst</h3>
            <p className="text-gray-300">OpenRouter AI analyzes results for patterns, emails, credentials</p>
          </div>
          <div className="magnetic-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-pink-500/25 hover:scale-105 transition-all duration-500 group hover:-rotate-2">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-3">Live Graphs</h3>
            <p className="text-gray-300">Interactive result graphs with magnetic hover effects</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .magnetic-card {
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .magnetic-card:hover {
          transform: translateZ(50px) scale(1.05);
        }
      `}</style>
    </div>
  )
}

