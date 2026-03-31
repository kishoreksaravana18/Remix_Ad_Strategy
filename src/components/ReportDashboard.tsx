import React, { useState } from 'react';
import { OfferDetails, StrategyReport } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Key, Target, FileText, 
  ChevronDown, ChevronUp, ExternalLink,
  Smartphone, Monitor, Tablet,
  AlertTriangle, CheckCircle2, Zap
} from 'lucide-react';

interface Props {
  offerDetails: OfferDetails;
  report: StrategyReport;
}

type Tab = 'overview' | 'competitors' | 'audiences' | 'keywords' | 'adcopy' | 'strategy';

export default function ReportDashboard({ offerDetails, report }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Zap className="w-4 h-4" /> },
    { id: 'competitors', label: 'Competitors', icon: <Users className="w-4 h-4" /> },
    { id: 'audiences', label: 'Audiences', icon: <Target className="w-4 h-4" /> },
    { id: 'keywords', label: 'Keywords', icon: <Key className="w-4 h-4" /> },
    { id: 'adcopy', label: 'Ad Copy', icon: <FileText className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8 min-h-[500px] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab report={report} offerDetails={offerDetails} />}
            {activeTab === 'competitors' && <CompetitorsTab competitors={report.competitors} />}
            {activeTab === 'audiences' && <AudiencesTab audiences={report.audiences} />}
            {activeTab === 'keywords' && <KeywordsTab keywords={report.keywords} />}
            {activeTab === 'adcopy' && <AdCopyTab adCopy={report.adCopy} />}
            {activeTab === 'strategy' && <StrategyTab strategy={report.strategy} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewTab({ report, offerDetails }: { report: StrategyReport; offerDetails: OfferDetails }) {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-500 text-sm font-medium mb-1">Competitors Found</div>
          <div className="text-3xl font-bold text-white">{report.kpis.competitorsCount}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-500 text-sm font-medium mb-1">Keywords Mined</div>
          <div className="text-3xl font-bold text-white">{report.kpis.keywordsCount}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-500 text-sm font-medium mb-1">Audience Segments</div>
          <div className="text-3xl font-bold text-white">{report.kpis.segmentsCount}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-zinc-500 text-sm font-medium mb-1">Ad Copy Variants</div>
          <div className="text-3xl font-bold text-white">{report.kpis.copyVariantsCount}</div>
        </div>
      </div>

      {/* Offer Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Core Value Proposition
          </h3>
          <p className="text-zinc-300 leading-relaxed">{report.offerAnalysis.valueProp}</p>
          
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-500 mb-3">Audience Tags</h4>
            <div className="flex flex-wrap gap-2">
              {report.offerAnalysis.audienceTags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Exploitable Gaps
          </h3>
          <ul className="space-y-3">
            {report.offerAnalysis.gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tech Analysis */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-400" />
          Technical & Page Speed Heuristics
        </h3>
        <p className="text-zinc-300 leading-relaxed font-mono text-sm">
          {offerDetails.pageSpeedHeuristics}
        </p>
      </div>
    </div>
  );
}

function CompetitorsTab({ competitors }: { competitors: StrategyReport['competitors'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500 text-sm">
            <th className="pb-4 font-medium">Competitor</th>
            <th className="pb-4 font-medium w-48">Estimated Strength</th>
            <th className="pb-4 font-medium">Exploitable Gap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {competitors.map((comp, i) => (
            <tr key={i} className="group hover:bg-zinc-900/50 transition-colors">
              <td className="py-4 pr-4">
                <div className="flex flex-col">
                  <span className="font-medium text-white">{comp.name}</span>
                  <a 
                    href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mt-1 w-fit"
                  >
                    {comp.url.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        comp.strength > 75 ? 'bg-red-500' : comp.strength > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${comp.strength}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 w-8">{comp.strength}</span>
                </div>
              </td>
              <td className="py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                  {comp.exploitableGap}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AudiencesTab({ audiences }: { audiences: StrategyReport['audiences'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {audiences.map((aud, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{aud.type}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              aud.bidModifier.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {aud.bidModifier}
            </span>
          </div>
          <h4 className="text-white font-medium mb-2">{aud.name}</h4>
          <p className="text-sm text-zinc-400 mb-4 flex-1">{aud.rationale}</p>
          <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Funnel Stage</span>
            <span className="text-xs font-medium text-zinc-300">{aud.funnelStage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function KeywordsTab({ keywords }: { keywords: StrategyReport['keywords'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {keywords.map((cluster, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/50 transition-colors"
          >
            <h3 className="text-lg font-medium text-white">{cluster.clusterName}</h3>
            {openIndex === i ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>
          
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-zinc-800 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Exact */}
                  <div>
                    <h4 className="text-sm font-medium text-emerald-400 mb-3">Exact Match</h4>
                    <div className="flex flex-wrap gap-2">
                      {cluster.exact.map((kw, j) => (
                        <span key={j} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-sm font-mono">
                          [{kw}]
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Phrase */}
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-3">Phrase Match</h4>
                    <div className="flex flex-wrap gap-2">
                      {cluster.phrase.map((kw, j) => (
                        <span key={j} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded text-sm font-mono">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Negative */}
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-3">Negative</h4>
                    <div className="flex flex-wrap gap-2">
                      {cluster.negative.map((kw, j) => (
                        <span key={j} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm font-mono">
                          -{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function AdCopyTab({ adCopy }: { adCopy: StrategyReport['adCopy'] }) {
  const [activeAngle, setActiveAngle] = useState(0);
  const currentSet = adCopy[activeAngle];

  return (
    <div className="space-y-8">
      {/* Angle Selector */}
      <div className="flex flex-wrap gap-2">
        {adCopy.map((set, i) => (
          <button
            key={i}
            onClick={() => setActiveAngle(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeAngle === i
                ? 'bg-white text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {set.angle}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Live Preview</h3>
          <div className="bg-[#202124] rounded-xl p-5 shadow-lg border border-zinc-800 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-white">Ad</span>
              <span className="text-sm text-zinc-400">·</span>
              <span className="text-sm text-zinc-300">https://www.example.com</span>
              <ExternalLink className="w-3 h-3 text-zinc-500 ml-auto" />
            </div>
            <div className="text-xl text-[#8ab4f8] hover:underline cursor-pointer mb-2 leading-tight">
              {currentSet.headlines[0]} | {currentSet.headlines[1]} | {currentSet.headlines[2]}
            </div>
            <div className="text-sm text-[#bdc1c6] leading-relaxed">
              {currentSet.descriptions[0]} {currentSet.descriptions[1]}
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Headlines (15)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentSet.headlines.map((hl, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300">
                  {hl}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Descriptions (4)</h3>
            <div className="grid grid-cols-1 gap-2">
              {currentSet.descriptions.map((desc, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300">
                  {desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyTab({ strategy }: { strategy: StrategyReport['strategy'] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Timeline */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-semibold text-white">30-Day Launch Plan</h3>
        <div className="relative border-l border-zinc-800 ml-3 space-y-8">
          {strategy.timeline.map((item, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-zinc-950" />
              <h4 className="text-sm font-bold text-emerald-400 mb-1">Week {item.week}</h4>
              <p className="text-zinc-300 text-sm leading-relaxed">{item.action}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-sm font-medium text-zinc-500 mb-2">Geo Priority</h4>
            <p className="text-white">{strategy.geoPriority}</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Device Bid Adjustments</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-zinc-300"><Smartphone className="w-4 h-4" /> Mobile</span>
                <span className="font-mono text-white">{strategy.deviceBids.mobile}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(10, strategy.deviceBids.mobile + 50)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-zinc-300"><Monitor className="w-4 h-4" /> Desktop</span>
                <span className="font-mono text-white">{strategy.deviceBids.desktop}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(10, strategy.deviceBids.desktop + 50)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-zinc-300"><Tablet className="w-4 h-4" /> Tablet</span>
                <span className="font-mono text-white">{strategy.deviceBids.tablet}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${Math.max(10, strategy.deviceBids.tablet + 50)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 bg-red-500/10 border-b border-zinc-800">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">What Losers Do</h4>
            <p className="text-sm text-zinc-300">{strategy.losersVsEdge.losers}</p>
          </div>
          <div className="p-4 bg-emerald-500/10">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Your Edge</h4>
            <p className="text-sm text-zinc-300">{strategy.losersVsEdge.edge}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
