'use client'
import { Lock, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { formatDate, getRiskTextClass } from '@/lib/utils'

export default function SSLCard({ data, index }: { data: any; index: number }) {
    if (!data) return null

    const error = !data.success ? data.error : undefined

    const daysRemaining = data.days_remaining
    const barWidth = daysRemaining > 0 ? Math.min(100, (daysRemaining / 365) * 100) : 0
    const barColor = daysRemaining < 0 ? '#ef4444' : daysRemaining < 30 ? '#f97316' : '#00ff88'

    return (
        <BaseCard title="SSL Certificate" icon={Lock} risk={data.risk_level} index={index} iconColor="#00ff88" error={error}>
            {data.success && (
                <div className="space-y-4">
                    {/* Issuer */}
                    <div>
                        <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Issuer</p>
                        <p className="text-white text-sm font-medium truncate">{data.issuer?.organization || 'Unknown'}</p>
                        <p className="text-[#8b949e] text-xs font-mono truncate">{data.issuer?.common_name}</p>
                    </div>

                    {/* Expiry */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[#484f58] text-xs font-mono uppercase">Expires</p>
                            <span className={`text-xs font-mono font-bold ${getRiskTextClass(data.risk_level)}`}>
                                {daysRemaining < 0 ? 'EXPIRED' : `${daysRemaining}d`}
                            </span>
                        </div>
                        <p className="text-[#8b949e] text-xs mb-2 font-mono">{formatDate(data.valid_until)}</p>
                        <div className="h-1.5 bg-[#161b22] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                            />
                        </div>
                    </div>

                    {/* TLS Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono mb-1">PROTOCOL</p>
                            <p className="text-white text-sm font-mono font-bold">{data.tls_version || 'N/A'}</p>
                        </div>
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono mb-1">BITS</p>
                            <p className="text-white text-sm font-mono font-bold">{data.cipher?.bits || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                        {data.risk_level === 'LOW' ? (
                            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                        ) : data.risk_level === 'CRITICAL' ? (
                            <XCircle className="w-4 h-4 text-[#ef4444]" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-[#f97316]" />
                        )}
                        <span className="text-[#8b949e] text-xs font-mono">{data.risk_label}</span>
                    </div>

                    {/* SANs count */}
                    {data.sans && data.sans.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1.5">Subject Alt Names ({data.sans.length})</p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.sans.slice(0, 3).map((san: string, i: number) => (
                                    <span key={i} className="text-xs font-mono text-[#8b949e] bg-[#161b22] px-2 py-0.5 rounded">
                                        {san.replace('DNS:', '').trim()}
                                    </span>
                                ))}
                                {data.sans.length > 3 && (
                                    <span className="text-xs font-mono text-[#484f58]">+{data.sans.length - 3}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </BaseCard>
    )
}