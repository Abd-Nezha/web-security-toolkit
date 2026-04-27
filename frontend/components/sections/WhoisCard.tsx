'use client'
import { Database, AlertTriangle, Calendar, User, Flag } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { formatDate, getRiskTextClass, getRiskBgClass } from '@/lib/utils'

export default function WhoisCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    return (
        <BaseCard title="WHOIS Intelligence" icon={Database} risk={data.risk_level} index={index} iconColor="#10b981">
            {data.success && (
                <div className="space-y-4">

                    {/* Domain age */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Domain Age</p>
                            <p className="text-white font-bold font-mono">
                                {data.domain_age_years !== null ? `${data.domain_age_years}y` : 'Unknown'}
                            </p>
                            <p className="text-[#8b949e] text-xs font-mono">{data.domain_age_days !== null ? `${data.domain_age_days} days` : ''}</p>
                        </div>
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Expires In</p>
                            <p className={`font-bold font-mono ${(data.days_until_expiry || 9999) < 30 ? 'text-[#ef4444]' :
                                    (data.days_until_expiry || 9999) < 90 ? 'text-[#f97316]' : 'text-[#22c55e]'
                                }`}>
                                {data.days_until_expiry !== null ? `${data.days_until_expiry}d` : 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Registrar */}
                    {data.registrar && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Registrar</p>
                            <p className="text-[#e6edf3] text-sm">{data.registrar}</p>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-2">
                        {data.creation_date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#484f58]" />
                                <span className="text-[#484f58] text-xs font-mono">Created:</span>
                                <span className="text-[#8b949e] text-xs font-mono">{formatDate(data.creation_date)}</span>
                            </div>
                        )}
                        {data.expiration_date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#484f58]" />
                                <span className="text-[#484f58] text-xs font-mono">Expires:</span>
                                <span className="text-[#8b949e] text-xs font-mono">{formatDate(data.expiration_date)}</span>
                            </div>
                        )}
                        {data.updated_date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#484f58]" />
                                <span className="text-[#484f58] text-xs font-mono">Updated:</span>
                                <span className="text-[#8b949e] text-xs font-mono">{formatDate(data.updated_date)}</span>
                            </div>
                        )}
                    </div>

                    {/* Registrant */}
                    {data.registrant && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Registrant</p>
                            <div className="flex items-start gap-2">
                                <User className="w-3.5 h-3.5 text-[#484f58] mt-0.5" />
                                <div>
                                    {data.registrant.org && <p className="text-[#8b949e] text-xs font-mono">{data.registrant.org}</p>}
                                    {data.registrant.country && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Flag className="w-3 h-3 text-[#484f58]" />
                                            <p className="text-[#484f58] text-xs font-mono">{data.registrant.country}</p>
                                        </div>
                                    )}
                                    {data.registrant.privacy_protected && (
                                        <span className="text-xs font-mono text-[#6b7280] bg-[#161b22] px-2 py-0.5 rounded mt-1 inline-block">
                                            Privacy Protected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DNSSEC */}
                    {data.dnssec && (
                        <div className="flex items-center gap-2">
                            <span className="text-[#484f58] text-xs font-mono">DNSSEC:</span>
                            <span className={`text-xs font-mono ${data.dnssec.toLowerCase().includes('signed') ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
                                {data.dnssec}
                            </span>
                        </div>
                    )}

                    {/* Suspicious flags */}
                    {data.suspicious_flags?.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">⚠ Suspicious Patterns</p>
                            <div className="space-y-2">
                                {data.suspicious_flags.map((flag: any, i: number) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getRiskBgClass(flag.severity)}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: flag.severity === 'HIGH' ? '#ef4444' : '#eab308' }} />
                                            <p className={`text-xs font-mono font-bold ${getRiskTextClass(flag.severity)}`}>{flag.type}</p>
                                        </div>
                                        <p className="text-[#8b949e] text-xs">{flag.description}</p>
                                        <p className="text-[#484f58] text-xs mt-1 italic">{flag.reason}</p>
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