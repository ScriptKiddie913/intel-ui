"use client"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8">
      {/* Header */}
      <header className="text-center mb-16">
        <h1 className="text-6xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Telegram AI Search
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Magnetic search interface with AI analysis - Search your Telegram data
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Search Panel */}
        <div className="space-y-8">
          <div className="relative group">
            <input
              type="text"
              placeholder="🔍 Enter keywords (email password phone...)"
              className="w-full p-8 text-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-500 hover:bg-white/20 shadow-2xl text-white placeholder-gray-400"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300">
              Search Now
            </button>
          </div>

          {/* Results Cards */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-3xl font-bold text-white flex items-center">
              📊 Live Results <span className="ml-3 text-sm bg-green-500/30 text-green-200 px-3 py-1 rounded-full">42 matches</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="group magnetic-card bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl p-6 rounded-2xl border border-white/20 hover:border-white/40 hover:shadow-2xl hover:shadow-blue-500/25 cursor-pointer hover:scale-105 transition-all duration-500" style={{perspective: '1000px'}}>
                  <h3 className="text-xl font-bold text-white mb-2">document_{Date.now()}.txt</h3>
                  <p className="text-gray-200 line-clamp-3">Found email: user{i}@gmail.com • Phone: +1-555-0123{i} • High confidence match</p>
                  <div className="mt-4 text-sm opacity-75">
                    Score: <span className="font-bold text-green-400">98.7%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              🤖 AI Intelligence Analyst
              <span className="ml-3 px-4 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">Live</span>
            </h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto bg-black/20 rounded-2xl p-6">
              <div className="flex justify-end">
                <div className="max-w-md p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Analyze these results for credential patterns
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-md p-4 rounded-2xl bg-white/10 text-white border border-white/20">
                  <strong>🔍 High-risk findings:</strong><br/>
                  • 42 Gmail accounts exposed<br/>
                  • 18 credential pairs<br/>
                  • Risk Score: <span className="text-red-400 font-bold">HIGH</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask AI about patterns, extract data, generate reports..."
                className="flex-1 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-white placeholder-gray-400"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300">
                Analyze →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .magnetic-card {
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .magnetic-card:hover {
          transform: translateZ(50px) rotateY(10deg) rotateX(5deg) scale(1.05) !important;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
