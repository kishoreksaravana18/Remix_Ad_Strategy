import React, { useState } from 'react';
import { extractOffer, generateStrategyReport } from '../services/ai';
import { OfferDetails, StrategyReport, CampaignType, AdCopyAngle } from '../types';
import { Loader2, Search, ArrowRight, CheckCircle2, Activity, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReportDashboard from './ReportDashboard';

type Step = 'idle' | 'extracting' | 'generating' | 'complete' | 'error';

const CAMPAIGN_TYPES: CampaignType[] = ['Search', 'Display', 'Demand Gen', 'PMax'];
const AD_COPY_ANGLES: AdCopyAngle[] = ['Standard', 'Urgency Based', 'Benefit Driven', 'Pain Point Agitation', 'Social Proof'];

export default function ReportGenerator() {
  const [url, setUrl] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('Search');
  const [adCopyAngle, setAdCopyAngle] = useState<AdCopyAngle>('Standard');
  const [step, setStep] = useState<Step>('idle');
  const [offerDetails, setOfferDetails] = useState<OfferDetails | null>(null);
  const [reportData, setReportData] = useState<StrategyReport | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setStep('extracting');
      setError('');
      setReportData(null);
      setOfferDetails(null);

      // Phase 1: Extract Offer & Page Speed
      const details = await extractOffer(url);
      setOfferDetails(details);

      // Phase 2-4: Generate Strategy Report
      setStep('generating');
      const report = await generateStrategyReport(url, details, campaignType, adCopyAngle);
      setReportData(report);

      setStep('complete');
    } catch (err: any) {
      console.error(err);
      
      let errorMessage = err.message || 'An error occurred during generation.';
      
      setError(errorMessage);
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        layout
        className={`w-full max-w-6xl mx-auto space-y-8 z-10 ${step === 'idle' ? 'mt-0' : 'mt-0'}`}
      >
        {/* Header */}
        <motion.div layout className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 mb-4"
          >
            <Zap className="w-3 h-3" />
            <span>v3.0 / AI Dashboard Engine</span>
          </motion.div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
            AD Strategy
          </h1>
        </motion.div>

        {/* Input Form */}
        <motion.form layout onSubmit={handleGenerate} className="relative max-w-3xl mx-auto w-full space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm w-fit">
              {CAMPAIGN_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCampaignType(type)}
                  disabled={step === 'extracting' || step === 'generating'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    campaignType === type 
                      ? 'bg-zinc-800 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm w-fit">
              <div className="pl-3 pr-1 py-2 text-zinc-500 flex items-center gap-2 border-r border-zinc-800/50">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Angle</span>
              </div>
              <select
                value={adCopyAngle}
                onChange={(e) => setAdCopyAngle(e.target.value as AdCopyAngle)}
                disabled={step === 'extracting' || step === 'generating'}
                className="bg-transparent text-zinc-300 text-sm font-medium px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:text-white transition-colors"
              >
                {AD_COPY_ANGLES.map(angle => (
                  <option key={angle} value={angle} className="bg-zinc-900 text-zinc-300">
                    {angle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex items-center group">
            <Search className="absolute left-5 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter landing page URL (e.g., https://example.com)"
              className="w-full pl-14 pr-36 py-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg text-white placeholder:text-zinc-600 backdrop-blur-sm"
              required
              disabled={step === 'extracting' || step === 'generating'}
            />
            <button
              type="submit"
              disabled={step === 'extracting' || step === 'generating' || !url}
              className="absolute right-2 top-2 bottom-2 px-6 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {step === 'idle' || step === 'complete' || step === 'error' ? (
                <>Run <ArrowRight className="w-4 h-4" /></>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </button>
          </div>
        </motion.form>

        {/* Progress Indicators */}
        <AnimatePresence mode="wait">
          {(step !== 'idle' || error) && !reportData && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto w-full"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
                <div className="flex items-center gap-4">
                  {step === 'extracting' ? (
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-ping" />
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin relative z-10" />
                    </div>
                  ) : step === 'generating' || step === 'complete' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${step === 'extracting' ? 'text-white' : 'text-zinc-400'}`}>
                      Phase 1: Offer Extraction & Technical Analysis
                    </h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Analyzing DOM, page speed heuristics, and offer DNA...</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {step === 'generating' ? (
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping" />
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin relative z-10" />
                    </div>
                  ) : step === 'complete' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${step === 'generating' ? 'text-white' : 'text-zinc-400'}`}>
                      Phase 2-4: Strategy Generation
                    </h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Building competitive intel, keywords, and ad copy matrix...</p>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-mono border border-red-500/20 flex items-start gap-3"
                  >
                    <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Viewer */}
        <AnimatePresence>
          {reportData && offerDetails && step === 'complete' && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <ReportDashboard report={reportData} offerDetails={offerDetails} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
