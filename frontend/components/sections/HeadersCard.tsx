'use client'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { getScoreColor } from '@/lib/utils'

export default function HeadersCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const gradeColor = data.grade === 'A' ? '#22c55e' :
        data.grade === 'B' ? '#86efac' :
            data.grade === 'C' ? '#eab308' :
                data.grade === 'D' ? '#f97316' : '#ef4444'

    return (
        <BaseCard title="Security Headers" icon={Shield} risk={data.grade === 'A' ? 'LOW' : data.grade === 'F' ? 'CRITICAL' : data.grade === 'D' ? 'HIGH' : 'MEDIUM'} index={index} iconColor="#00aaff">
            {data.success && (
                <div className="space-y-4">
                    {/* Grade + Score */}
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center border"
                                style={{ borderColor: `${gradeColor}30`, backgroundColor: `${gradeColor}10` }}>
                                <span className="font-display text-2xl font-bold" style={{ color: gradeColor }}>{data.grade}</span>
                            </div>
                            <p className="text-[#484f58] text-xs font-mono mt-1">GRADE</p>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-mono mb-1">
                                <span className="text-[#8b949e]">Score</span>
                                <span style={{ color: getScoreColor(data.score) }}>{data.score}%</span>
                            </div>
                            <div className="h-2 bg-[#161b22] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${data.score}%`, backgroundColor: getScoreColor(data.score) }} />
                            </div>
                            <div className="flex justify-between text-xs font-mono mt-2 text-[#484f58]">
                                <span>{data.summary?.present}/{data.summary?.total} headers</span>
                                <span className="text-[#ef4444]">{data.summary?.high_risk_missing} critical missing</span>
                            </div>
                        </div>
                    </div>

                    {/* Header list */}
                    <div className="space-y-1.5">
                        {(data.headers || []).map((h: any) => (
                            <div key={h.header} className="flex items-center gap-2 py-1">
                                {h.present ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0" />
                                ) : (
                                    <XCircle className={`w-3.5 h-3.5 flex-shrink-0 ${h.risk_if_missing === 'HIGH' ? 'text-[#ef4444]' :
                                            h.risk_if_missing === 'MEDIUM' ? 'text-[#f97316]' : 'text-[#eab308]'
                                        }`} />
                                )}
                                <span className={`text-xs font-mono truncate ${h.present ? 'text-[#8b949e]' : 'text-[#e6edf3]'}`}>
                                    {h.header}
                                </span>
                                {!h.present && (
                                    <span className={`ml-auto text-xs font-mono flex-shrink-0 ${h.risk_if_missing === 'HIGH' ? 'text-[#ef4444]' :
                                            h.risk_if_missing === 'MEDIUM' ? 'text-[#f97316]' : 'text-[#eab308]'
                                        }`}>{h.risk_if_missing}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Info leakage */}
                    {data.info_leakage?.server && (
                        <div className="bg-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.2)] rounded-lg p-3">
                            <p className="text-[#f97316] text-xs font-mono font-bold mb-1">SERVER EXPOSED</p>
                            <p className="text-[#8b949e] text-xs font-mono">{data.info_leakage.server}</p>
                        </div>
                    )}
                </div>
            )}
        </BaseCard>
    )
}