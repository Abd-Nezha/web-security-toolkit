'use client'
import { Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { getRiskTextClass } from '@/lib/utils'

export default function ReputationCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const vt = data.virustotal
    const gsb = data.google_safe_browsing
    const totalEngines = vt?.total_engines || 0
    const maliciousCount = vt?.malicious_count || 0
    const cleanPercent = totalEngines > 0 ? Math.round(((totalEngines - maliciousCount) / totalEngines) * 100) : 100

    return (
        <BaseCard title="Domain Reputation" icon={Zap} risk={data.overall_risk} index={index} iconColor="#eab308">
            {data.success && (
                <div className="space-y-4">

                    {/* Overall verdict */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${data.is_malicious
                            ? 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]'
                            : 'bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.15)]'
                        }`}>
                        {data.is_malicious
                            ? <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                            : <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                        }
                        <p className={`text-sm font-mono ${data.is_malicious ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                            {data.verdict}
                        </p>
                    </div>

                    {/* VirusTotal */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[#484f58] text-xs font-mono uppercase">VirusTotal</p>
                            {vt?.available ? (
                                <span className={`text-xs font-mono font-bold ${getRiskTextClass(data.overall_risk)}`}>
                                    {maliciousCount}/{totalEngines} flagged
                                </span>
                            ) : (
                                <span className="text-xs font-mono text-[#484f58]">API key needed</span>
                            )}
                        </div>

                        {vt?.available && vt?.found ? (
                            <>
                                {/* Detection bar */}
                                <div className="h-2 bg-[#161b22] rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${cleanPercent}%`,
                                            backgroundColor: maliciousCount > 0 ? '#ef4444' : '#22c55e'
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-[#161b22] rounded-lg p-2 text-center">
                                        <p className="text-[#ef4444] font-bold font-mono text-sm">{vt.malicious_count}</p>
                                        <p className="text-[#484f58] text-xs font-mono">malicious</p>
                                    </div>
                                    <div className="bg-[#161b22] rounded-lg p-2 text-center">
                                        <p className="text-[#eab308] font-bold font-mono text-sm">{vt.suspicious_count}</p>
                                        <p className="text-[#484f58] text-xs font-mono">suspicious</p>
                                    </div>
                                    <div className="bg-[#161b22] rounded-lg p-2 text-center">
                                        <p className="text-[#22c55e] font-bold font-mono text-sm">{vt.harmless_count}</p>
                                        <p className="text-[#484f58] text-xs font-mono">harmless</p>
                                    </div>
                                </div>

                                {vt.reputation !== undefined && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <p className="text-[#484f58] text-xs font-mono">Reputation Score:</p>
                                        <span className={`text-xs font-mono font-bold ${vt.reputation >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                            {vt.reputation}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : vt?.available && !vt?.found ? (
                            <p className="text-[#484f58] text-xs font-mono">Not found in VirusTotal database</p>
                        ) : (
                            <div className="bg-[#161b22] rounded-lg p-3">
                                <p className="text-[#484f58] text-xs font-mono">{vt?.note || 'Configure VIRUSTOTAL_API_KEY in .env'}</p>
                            </div>
                        )}
                    </div>

                    {/* Google Safe Browsing */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[#484f58] text-xs font-mono uppercase">Google Safe Browsing</p>
                        </div>

                        {gsb?.available ? (
                            <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${gsb.is_safe
                                    ? 'bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.15)]'
                                    : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]'
                                }`}>
                                {gsb.is_safe
                                    ? <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                                    : <XCircle className="w-4 h-4 text-[#ef4444]" />
                                }
                                <span className={`text-xs font-mono ${gsb.is_safe ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                    {gsb.is_safe ? 'No threats detected' : `Threats: ${gsb.threat_types?.join(', ')}`}
                                </span>
                            </div>
                        ) : (
                            <div className="bg-[#161b22] rounded-lg p-3">
                                <p className="text-[#484f58] text-xs font-mono">{gsb?.note || 'Configure GOOGLE_SAFE_BROWSING_API_KEY in .env'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BaseCard>
    )
}