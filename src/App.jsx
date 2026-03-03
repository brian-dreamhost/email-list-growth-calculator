import { useState, useMemo, memo } from 'react'

function projectGrowth(listSize, monthlyGrowthRate, monthlyChurnRate, months, revenuePerSub) {
  const data = []
  let current = listSize
  let totalGained = 0
  let totalLost = 0
  let totalRevenue = 0

  for (let i = 0; i <= months; i++) {
    const revenue = current * revenuePerSub
    totalRevenue += i > 0 ? revenue : 0
    data.push({
      month: i,
      size: Math.round(current),
      gained: i === 0 ? 0 : Math.round(current * (monthlyGrowthRate / 100)),
      lost: i === 0 ? 0 : Math.round(current * (monthlyChurnRate / 100)),
      revenue: Math.round(revenue),
      cumulativeRevenue: Math.round(totalRevenue),
    })
    if (i < months) {
      const gained = current * (monthlyGrowthRate / 100)
      const lost = current * (monthlyChurnRate / 100)
      totalGained += gained
      totalLost += lost
      current = current + gained - lost
      if (current < 0) current = 0
    }
  }

  const netGrowthRate = monthlyGrowthRate - monthlyChurnRate
  const doublingMonths = netGrowthRate > 0 ? Math.ceil(Math.log(2) / Math.log(1 + netGrowthRate / 100)) : null
  const milestones = [1000, 2500, 5000, 10000, 25000, 50000, 100000].filter(m => m > listSize).map(target => {
    if (netGrowthRate <= 0) return { target, months: null }
    const monthsNeeded = Math.ceil(Math.log(target / listSize) / Math.log(1 + netGrowthRate / 100))
    return { target, months: monthsNeeded }
  }).slice(0, 4)

  return {
    projections: data,
    totalGained: Math.round(totalGained),
    totalLost: Math.round(totalLost),
    netGrowthRate,
    doublingMonths,
    milestones,
    finalSize: Math.round(current),
  }
}

const BarChart = memo(function BarChart({ data, maxMonths }) {
  if (data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d.size))
  const displayData = data.filter((_, i) => {
    if (maxMonths <= 12) return true
    if (maxMonths <= 24) return i % 2 === 0 || i === data.length - 1
    return i % 3 === 0 || i === data.length - 1
  })

  return (
    <div className="flex items-end gap-1 h-48">
      {displayData.map((d, i) => {
        const height = maxVal > 0 ? (d.size / maxVal) * 100 : 0
        const isGrowing = data.length > 1 && d.size >= data[0].size
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-galactic truncate">{d.size >= 1000 ? `${(d.size / 1000).toFixed(1)}k` : d.size}</span>
            <div className={`w-full rounded-t transition-all ${isGrowing ? 'bg-azure' : 'bg-coral/70'}`} style={{ height: `${Math.max(2, height)}%` }} />
            <span className="text-[10px] text-galactic">M{d.month}</span>
          </div>
        )
      })}
    </div>
  )
})

export default function App() {
  const [listSize, setListSize] = useState(1000)
  const [growthRate, setGrowthRate] = useState(5)
  const [churnRate, setChurnRate] = useState(2)
  const [months, setMonths] = useState(12)
  const [revenuePerSub, setRevenuePerSub] = useState(1)
  const [showScenarios, setShowScenarios] = useState(false)

  const fillTestData = () => {
    setListSize(4500)
    setGrowthRate(6.5)
    setChurnRate(1.8)
    setMonths(12)
    setRevenuePerSub(2.50)
  }

  const result = useMemo(() =>
    projectGrowth(listSize, growthRate, churnRate, months, revenuePerSub),
    [listSize, growthRate, churnRate, months, revenuePerSub]
  )

  const optimistic = useMemo(() =>
    projectGrowth(listSize, growthRate * 1.5, churnRate * 0.7, months, revenuePerSub),
    [listSize, growthRate, churnRate, months, revenuePerSub]
  )

  const pessimistic = useMemo(() =>
    projectGrowth(listSize, growthRate * 0.5, churnRate * 1.5, months, revenuePerSub),
    [listSize, growthRate, churnRate, months, revenuePerSub]
  )

  const isGrowing = result.netGrowthRate > 0
  const isDeclining = result.netGrowthRate < 0
  const isStagnant = result.netGrowthRate === 0

  return (
    <div className="min-h-screen bg-abyss bg-glow bg-grid">
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
        <nav className="mb-8 text-sm text-galactic">
          <a href="https://seo-tools-tau.vercel.app/" className="text-azure hover:text-white transition-colors">Free Tools</a>
          <span className="mx-2 text-metal">/</span>
          <a href="https://seo-tools-tau.vercel.app/email-marketing/" className="text-azure hover:text-white transition-colors">Email Marketing</a>
          <span className="mx-2 text-metal">/</span>
          <span className="text-cloudy">Email List Growth Calculator</span>
        </nav>

        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 border border-turtle text-turtle rounded-full text-sm font-medium mb-6">Free Tool</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Email List Growth Calculator</h1>
          <p className="text-cloudy text-lg max-w-2xl mx-auto">Project your email list growth over time. See milestones, scenario comparisons, and estimated revenue impact.</p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={fillTestData}
            className="px-3 py-1.5 text-xs font-mono bg-prince/20 text-prince border border-prince/30 rounded hover:bg-prince/30 transition-colors focus:outline-none focus:ring-2 focus:ring-prince focus:ring-offset-2 focus:ring-offset-abyss"
          >
            Fill Test Data
          </button>
        </div>

        {/* Inputs */}
        <div className="card-gradient border border-metal/20 rounded-2xl p-6 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-galactic block mb-1">Current List Size</label>
              <input type="number" value={listSize} onChange={(e) => setListSize(Math.max(0, Number(e.target.value)))} className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-azure transition-colors" />
            </div>
            <div>
              <label className="text-xs text-galactic block mb-1">Monthly Growth Rate (%)</label>
              <input type="number" step="0.1" value={growthRate} onChange={(e) => setGrowthRate(Math.max(0, Number(e.target.value)))} className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-azure transition-colors" />
              <p className="text-xs text-galactic mt-1">New subscribers gained each month as % of list</p>
            </div>
            <div>
              <label className="text-xs text-galactic block mb-1">Monthly Churn Rate (%)</label>
              <input type="number" step="0.1" value={churnRate} onChange={(e) => setChurnRate(Math.max(0, Number(e.target.value)))} className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-azure transition-colors" />
              <p className="text-xs text-galactic mt-1">Unsubscribes + bounces as % of list</p>
            </div>
            <div>
              <label className="text-xs text-galactic block mb-1">Projection Period</label>
              <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-azure transition-colors">
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-galactic block mb-1">Revenue per Subscriber / month ($)</label>
              <input type="number" step="0.01" value={revenuePerSub} onChange={(e) => setRevenuePerSub(Math.max(0, Number(e.target.value)))} className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-azure transition-colors" />
              <p className="text-xs text-galactic mt-1">Average monthly revenue attributed per subscriber</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Final List Size', value: result.finalSize.toLocaleString(), color: isGrowing ? 'text-turtle' : isDeclining ? 'text-coral' : 'text-cloudy' },
            { label: 'Net Growth Rate', value: `${result.netGrowthRate > 0 ? '+' : ''}${result.netGrowthRate.toFixed(1)}% / mo`, color: isGrowing ? 'text-turtle' : isDeclining ? 'text-coral' : 'text-tangerine' },
            { label: 'Total Gained', value: `+${result.totalGained.toLocaleString()}`, color: 'text-azure' },
            { label: 'Total Lost', value: `-${result.totalLost.toLocaleString()}`, color: 'text-coral' },
          ].map((stat, i) => (
            <div key={i} className="card-gradient border border-metal/20 rounded-xl p-4 text-center hover-lift animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
              <p className="text-xs text-galactic mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card-gradient border border-metal/20 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-white mb-4">Growth Projection</h3>
          <BarChart data={result.projections} maxMonths={months} />
          {isDeclining && (
            <div className="mt-4 p-3 rounded-lg bg-coral/10 border border-coral/20">
              <p className="text-sm text-coral">Your list is declining. Churn ({churnRate}%) exceeds growth ({growthRate}%). Focus on reducing churn through better content, segmentation, and re-engagement campaigns.</p>
            </div>
          )}
          {isStagnant && (
            <div className="mt-4 p-3 rounded-lg bg-tangerine/10 border border-tangerine/20">
              <p className="text-sm text-tangerine">Growth and churn are equal — your list will stay flat. Increase acquisition or reduce churn to grow.</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        {result.milestones.length > 0 && (
          <div className="card-gradient border border-metal/20 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-white mb-4">Milestones</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-midnight/50 rounded-lg p-3 animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="text-sm text-cloudy">{m.target.toLocaleString()} subscribers</span>
                  {m.months !== null ? (
                    <span className="text-sm font-medium text-azure">{m.months} months</span>
                  ) : (
                    <span className="text-sm text-coral">Not reachable</span>
                  )}
                </div>
              ))}
              {result.doublingMonths && (
                <div className="flex items-center justify-between bg-midnight/50 rounded-lg p-3">
                  <span className="text-sm text-cloudy">Double your list</span>
                  <span className="text-sm font-medium text-turtle">{result.doublingMonths} months</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revenue */}
        {revenuePerSub > 0 && (
          <div className="card-gradient border border-metal/20 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-white mb-4">Revenue Projection</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-midnight/50 rounded-lg p-3 text-center">
                <p className="text-xs text-galactic mb-1">Current Monthly Revenue</p>
                <p className="text-xl font-bold text-white">${(listSize * revenuePerSub).toLocaleString()}</p>
              </div>
              <div className="bg-midnight/50 rounded-lg p-3 text-center">
                <p className="text-xs text-galactic mb-1">Projected Monthly (M{months})</p>
                <p className="text-xl font-bold text-azure">${(result.finalSize * revenuePerSub).toLocaleString()}</p>
              </div>
              <div className="bg-midnight/50 rounded-lg p-3 text-center">
                <p className="text-xs text-galactic mb-1">Total Revenue ({months}mo)</p>
                <p className="text-xl font-bold text-turtle">${result.projections[result.projections.length - 1]?.cumulativeRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios */}
        <div className="card-gradient border border-metal/20 rounded-2xl p-5 mb-6">
          <button onClick={() => setShowScenarios(!showScenarios)} className="w-full flex items-center justify-between text-left">
            <h3 className="font-semibold text-white">Scenario Comparison</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 text-galactic transition-transform ${showScenarios ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
          </button>
          {showScenarios && (
            <div className="mt-4">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-galactic font-medium">Scenario</div>
                <div className="text-galactic font-medium text-center">Growth/Churn</div>
                <div className="text-galactic font-medium text-center">Final Size</div>
                <div className="text-galactic font-medium text-center">Revenue ({months}mo)</div>

                <div className="text-tangerine">Pessimistic</div>
                <div className="text-center text-cloudy">{(growthRate * 0.5).toFixed(1)}% / {(churnRate * 1.5).toFixed(1)}%</div>
                <div className="text-center text-tangerine font-medium">{pessimistic.finalSize.toLocaleString()}</div>
                <div className="text-center text-cloudy">${pessimistic.projections[pessimistic.projections.length - 1]?.cumulativeRevenue.toLocaleString()}</div>

                <div className="text-azure">Current Pace</div>
                <div className="text-center text-cloudy">{growthRate}% / {churnRate}%</div>
                <div className="text-center text-azure font-medium">{result.finalSize.toLocaleString()}</div>
                <div className="text-center text-cloudy">${result.projections[result.projections.length - 1]?.cumulativeRevenue.toLocaleString()}</div>

                <div className="text-turtle">Optimistic</div>
                <div className="text-center text-cloudy">{(growthRate * 1.5).toFixed(1)}% / {(churnRate * 0.7).toFixed(1)}%</div>
                <div className="text-center text-turtle font-medium">{optimistic.finalSize.toLocaleString()}</div>
                <div className="text-center text-cloudy">${optimistic.projections[optimistic.projections.length - 1]?.cumulativeRevenue.toLocaleString()}</div>
              </div>
              <p className="text-xs text-galactic mt-3">Pessimistic = 50% growth, 150% churn. Optimistic = 150% growth, 70% churn.</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card-gradient border border-metal/20 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Growth Strategies</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { title: 'Reduce churn first', text: 'Keeping existing subscribers is 5x cheaper than acquiring new ones. Improve content relevance and frequency.' },
              { title: 'Add signup incentives', text: 'Offer lead magnets (guides, templates, discounts) to boost monthly signups by 30–50%.' },
              { title: 'Run a re-engagement campaign', text: 'Email inactive subscribers with a compelling offer. Remove non-responders to improve engagement metrics.' },
              { title: 'Optimize signup forms', text: 'A/B test form placement, copy, and number of fields. Pop-ups convert 3% on average.' },
            ].map((tip, i) => (
              <div key={i} className="bg-midnight/50 rounded-lg p-3 hover-lift animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
                <p className="font-medium text-azure mb-1">{tip.title}</p>
                <p className="text-galactic text-xs">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-metal/30 mt-16">
        <div className="max-w-[1600px] mx-auto px-4 py-6 text-center text-sm text-galactic">
          Free marketing tools by <a href="https://www.dreamhost.com" target="_blank" rel="noopener" className="text-azure hover:text-white transition-colors">DreamHost</a>
        </div>
      </footer>
    </div>
  )
}
