'use client'
import { BarChart2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { getRiskTextClass, getRiskBgClass } from '@/lib/utils'

export default function BlacklistCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const vt = data.virustotal_history
    const gsb = data.google_safe_browsing
    const flaggingEngines = vt?.flagging_engines ? Object.entries(vt.flagging_engines) : []

    return (
        <BaseCard title="Blacklist History" icon={BarChart2} risk={data.overall_risk} index={index} iconColor="#ec4899">
            {data.success && (
                <div className="space-y-4">

                    {/* Verdict banner */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${data.clean
                            ? 'bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.15)]'
                            : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]'
                        }`}>
                        {data.clean
                            ? <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                            : <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                        }
                        <div>
                            <p className={`text-sm font-mono font-bold ${data.clean ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                {data.clean ? 'CLEAN' : `${data.total_flags} FLAGS FOUND`}
                            </p>
                            <p className="text-[#8b949e] text-xs">{data.verdict}</p>
                        </div>
                    </div>

                    {/* VirusTotal engine results */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[#484f58] text-xs font-mono uppercase">VirusTotal Engines</p>
                            {vt?.available && vt?.found && (
                                <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-[#22c55e]">{vt.stats?.harmless || 0} clean</span>
                                    <span className="text-[#ef4444]">{vt.stats?.malicious || 0} flagged</span>
                                </div>
                            )}
                        </div>

                        {!vt?.available ? (
                            <div className="bg-[#161b22] rounded-lg p-3">
                                <p className="text-[#484f58] text-xs font-mono">{vt?.note || 'Configure VIRUSTOTAL_API_KEY'}</p>
                            </div>
                        ) : flaggingEngines.length > 0 ? (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {flaggingEngines.map(([engine, result]: [string, any]) => (
                                    <div key={engine} className="flex items-center gap-2 py-1 px-2 bg-[rgba(239,68,68,0.05)] rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                                        <span className="text-[#e6edf3] text-xs font-mono flex-1 truncate">{engine}</span>
                                        <span className="text-[#ef4444] text-xs font-mono capitalize">{result.category}</span>
                                    </div>
                                ))}
                            </div>
                        ) : vt?.available && vt?.found ? (
                            <div className="flex items-center gap-2 p-2.5 bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] rounded-lg">
                                <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                                <span className="text-[#22c55e] text-xs font-mono">No engines flagged this domain</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Google Safe Browsing */}
                    <div>
                        <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Google Safe Browsing</p>
                        {!gsb?.available ? (
                            <div className="bg-[#161b22] rounded-lg p-3">
                                <p className="text-[#484f58] text-xs font-mono">{gsb?.note || 'Configure GOOGLE_SAFE_BROWSING_API_KEY'}</p>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${gsb.is_safe
                                    ? 'bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.15)]'
                                    : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]'
                                }`}>
                                {gsb.is_safe
                                    ? <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                                    : <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                                }
                                <span className={`text-xs font-mono ${gsb.is_safe ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                    {gsb.is_safe ? 'Not blacklisted by Google' : `Threat: ${gsb.threat_types?.join(', ')}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Risk events timeline */}
                    {data.risk_events?.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Risk Events</p>
                            <div className="space-y-1.5">
                                {data.risk_events.slice(0, 5).map((event: any, i: number) => (
                                    <div key={i} className={`p-2.5 rounded-lg border ${getRiskBgClass(event.severity)}`}>
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-xs font-mono font-bold ${getRiskTextClass(event.severity)}`}>{event.type}</span>
                                            <span className="text-[#484f58] text-xs font-mono">{event.source}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </BaseCard>
    )
}