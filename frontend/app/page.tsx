'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Search, Globe, Lock, AlertTriangle, Zap, Database, Clock, BarChart2, Terminal } from 'lucide-react'
import { runFullScan } from '@/lib/api'
import { getRiskColor, getRiskTextClass, getRiskBgClass, getScoreColor } from '@/lib/utils'
import SSLCard from '@/components/sections/SSLCard'
import HeadersCard from '@/components/sections/HeadersCard'
import VulnerabilityCard from '@/components/sections/VulnerabilityCard'
import DNSCard from '@/components/sections/DNSCard'
import ReputationCard from '@/components/sections/ReputationCard'
import PortsCard from '@/components/sections/PortsCard'
import WaybackCard from '@/components/sections/WaybackCard'
import WhoisCard from '@/components/sections/WhoisCard'
import BlacklistCard from '@/components/sections/BlacklistCard'
import SkeletonCard from '@/components/ui/SkeletonCard'

const SCAN_STEPS = [
    { icon: Lock, label: 'Inspecting SSL Certificate...' },
    { icon: Shield, label: 'Auditing Security Headers...' },
    { icon: AlertTriangle, label: 'Scanning Vulnerabilities...' },
    { icon: Globe, label: 'Resolving DNS Records...' },
    { icon: Zap, label: 'Checking Domain Reputation...' },
    { icon: Terminal, label: 'Probing Open Ports...' },
    { icon: Clock, label: 'Fetching Wayback History...' },
    { icon: Database, label: 'Querying WHOIS Database...' },
    { icon: BarChart2, label: 'Checking Blacklist History...' },
]

export default function Home() {
    const [domain, setDomain] = useState('')
    const [loading, setLoading] = useState(false)
    const [scanStep, setScanStep] = useState(0)
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!domain.trim()) return

        setLoading(true)
        setError(null)
        setResults(null)
        setScanStep(0)

        // Animate scan steps
        const stepInterval = setInterval(() => {
            setScanStep(prev => {
                if (prev >= SCAN_STEPS.length - 1) {
                    clearInterval(stepInterval)
                    return prev
                }
                return prev + 1
            })
        }, 700)

        try {
            const data = await runFullScan(domain.trim())
            setResults(data)
            clearInterval(stepInterval)
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 300)
        } catch (err: any) {
            clearInterval(stepInterval)
            setError(err?.response?.data?.detail || err?.message || 'Scan failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const overallRisk = results?.overall_risk
    const riskScore = results?.risk_score

    return (
        <div className="min-h-screen bg-[#030712] bg-grid relative overflow-x-hidden">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-[#00ff88] opacity-[0.03] rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-[#00aaff] opacity-[0.02] rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-[#00ff88] opacity-[0.02] rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-[rgba(0,255,136,0.08)] bg-[rgba(3,7,18,0.8)] backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-9 h-9 rounded-lg bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#00ff88]" />
                        </div>
                        <div>
                            <span className="font-display text-white font-bold text-lg tracking-tight">WSIT</span>
                            <span className="hidden sm:inline text-[#8b949e] text-sm ml-2">Web Security Intelligence Toolkit</span>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 text-xs font-mono text-[#8b949e]"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                        <span>SYSTEM ONLINE</span>
                    </motion.div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-20 pb-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.15)] text-[#00ff88] text-xs font-mono mb-8"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                        PROFESSIONAL SECURITY ANALYSIS PLATFORM
                    </motion.div>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        Security Intelligence
                        <br />
                        <span className="text-[#00ff88] glow-text">Redefined</span>
                    </h1>

                    <p className="text-[#8b949e] text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Deep security analysis across SSL, DNS, vulnerabilities, reputation, and historical intelligence — all in one scan.
                    </p>

                    {/* Scan Input */}
                    <form onSubmit={handleScan} className="max-w-2xl mx-auto">
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[rgba(0,255,136,0.1)] to-[rgba(0,170,255,0.05)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex gap-3 p-2 rounded-2xl bg-[#0d1117] border border-[rgba(0,255,136,0.12)] shadow-2xl">
                                <div className="flex items-center pl-4">
                                    <Globe className="w-5 h-5 text-[#8b949e]" />
                                </div>
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="Enter domain (e.g. example.com)"
                                    className="flex-1 bg-transparent text-white placeholder-[#484f58] font-mono text-base outline-none py-3 pr-2 input-glow"
                                    disabled={loading}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <motion.button
                                    type="submit"
                                    disabled={loading || !domain.trim()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 rounded-xl bg-[#00ff88] text-[#030712] font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#00e67a] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#030712] border-t-transparent rounded-full animate-spin" />
                                            Scanning
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" />
                                            Analyze
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <p className="text-[#484f58] text-xs mt-3 font-mono">
                            SSL · DNS · Headers · Ports · Reputation · WHOIS · Wayback · Blacklist
                        </p>
                    </form>
                </motion.section>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-12"
                        >
                            {/* Scan progress */}
                            <div className="max-w-lg mx-auto mb-10">
                                <div className="bg-[#0d1117] border border-[rgba(0,255,136,0.12)] rounded-2xl p-6 scan-overlay">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                                        <span className="font-mono text-[#00ff88] text-sm">SCANNING: {domain}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {SCAN_STEPS.map((step, idx) => {
                                            const Icon = step.icon
                                            const isActive = idx === scanStep
                                            const isDone = idx < scanStep
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-[rgba(0,255,136,0.05)]' : ''
                                                        }`}
                                                >
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isDone ? 'text-[#00ff88]' :
                                                        isActive ? 'text-[#00ff88] animate-pulse' :
                                                            'text-[#484f58]'
                                                        }`} />
                                                    <span className={`font-mono text-xs ${isDone ? 'text-[#00ff88] line-through opacity-50' :
                                                        isActive ? 'text-[#e6edf3]' :
                                                            'text-[#484f58]'
                                                        }`}>
                                                        {step.label}
                                                    </span>
                                                    {isDone && (
                                                        <span className="ml-auto text-[#00ff88] text-xs font-mono">✓</span>
                                                    )}
                                                    {isActive && (
                                                        <div className="ml-auto w-3 h-3 border border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <SkeletonCard key={i} delay={i * 0.05} />
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="max-w-lg mx-auto mb-12"
                        >
                            <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                                <p className="text-red-400 font-mono text-sm">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 text-[#8b949e] text-xs hover:text-white transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {results && !loading && (
                        <motion.section
                            ref={resultsRef}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="pb-20"
                        >
                            {/* Overall Risk Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className={`rounded-2xl border p-6 sm:p-8 ${getRiskBgClass(overallRisk)} mb-6`}>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Shield className="w-6 h-6" style={{ color: getRiskColor(overallRisk) }} />
                                                <span className="font-mono text-[#8b949e] text-sm uppercase tracking-wider">Security Assessment</span>
                                                {results.cached && (
                                                    <span className="text-xs font-mono bg-[rgba(139,148,158,0.1)] text-[#8b949e] px-2 py-0.5 rounded-full border border-[rgba(139,148,158,0.2)]">
                                                        CACHED
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
                                                {results.domain}
                                            </h2>
                                            <p className={`font-bold text-xl ${getRiskTextClass(overallRisk)}`}>
                                                {overallRisk} RISK
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Score circle */}
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                    <circle
                                                        cx="48" cy="48" r="40" fill="none"
                                                        stroke={getScoreColor(riskScore)}
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - riskScore / 100)}`}
                                                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="font-display text-2xl font-bold text-white">{riskScore}</span>
                                                    <span className="text-[#8b949e] text-xs font-mono">SCORE</span>
                                                </div>
                                            </div>

                                            {/* Risk breakdown */}
                                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                {Object.entries(results.summary || {}).map(([key, risk]: [string, any]) => (
                                                    <div key={key} className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getRiskColor(risk) }} />
                                                        <span className="text-[#8b949e] capitalize">{key}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Result Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                <SSLCard data={results.ssl} index={0} />
                                <HeadersCard data={results.headers} index={1} />
                                <VulnerabilityCard data={results.vulnerabilities} index={2} />
                                <DNSCard data={results.dns} index={3} />
                                <ReputationCard data={results.reputation} index={4} />
                                <PortsCard data={results.ports} index={5} />
                                <WhoisCard data={results.whois} index={6} />
                                <WaybackCard data={results.wayback} index={7} />
                                <BlacklistCard data={results.blacklist} index={8} />
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Feature Grid (shown when no results) */}
                {!results && !loading && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pb-20"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: Lock, title: 'SSL Inspector', desc: 'Certificate chain analysis, expiry tracking, TLS version detection', color: '#00ff88' },
                                { icon: Shield, title: 'Header Audit', desc: 'CSP, HSTS, X-Frame-Options, CORS and 8+ security headers', color: '#00aaff' },
                                { icon: AlertTriangle, title: 'Vuln Scanner', desc: 'Known CVE detection, server fingerprinting, misconfiguration flags', color: '#f97316' },
                                { icon: Globe, title: 'DNS Intelligence', desc: 'A, MX, NS, TXT records with hosting & CDN provider detection', color: '#a855f7' },
                                { icon: Zap, title: 'Reputation Check', desc: 'VirusTotal + Google Safe Browsing real-time threat intelligence', color: '#eab308' },
                                { icon: Terminal, title: 'Port Scanner', desc: '19 common ports scanned with risk assessment per service', color: '#ef4444' },
                                { icon: Clock, title: 'Wayback Machine', desc: 'Historical snapshots timeline and site evolution tracking', color: '#06b6d4' },
                                { icon: Database, title: 'WHOIS Analysis', desc: 'Registration history, ownership patterns, suspicious flags', color: '#10b981' },
                                { icon: BarChart2, title: 'Blacklist History', desc: 'Aggregated blacklist flags from 80+ security vendors', color: '#ec4899' },
                            ].map((feat, idx) => {
                                const Icon = feat.icon
                                return (
                                    <motion.div
                                        key={feat.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="group p-5 rounded-xl bg-[#0d1117] border border-[rgba(255,255,255,0.04)] card-hover cursor-default"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                                                <Icon className="w-5 h-5" style={{ color: feat.color }} />
                                            </div>
                                            <div>
                                                <h3 className="font-display text-white font-semibold mb-1">{feat.title}</h3>
                                                <p className="text-[#8b949e] text-sm leading-relaxed">{feat.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.section>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[rgba(0,255,136,0.06)] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[#484f58] text-xs font-mono">
                        © 2024 Web Security Intelligence Toolkit · For authorized security testing only
                    </p>
                    <div className="flex items-center gap-4 text-[#484f58] text-xs font-mono">
                        <span>FastAPI + Next.js</span>
                        <span>·</span>
                        <span>Redis Cached</span>
                        <span>·</span>
                        <span>Rate Limited</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}