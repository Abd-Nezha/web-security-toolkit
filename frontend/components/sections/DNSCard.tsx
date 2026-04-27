'use client'
import { Globe, Server, Mail, Shield } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'

export default function DNSCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const aRecords: string[] = data.records?.A || []
    const mxRecords: any[] = data.records?.MX || []
    const nsRecords: string[] = data.records?.NS || []

    return (
        <BaseCard title="DNS & IP Intelligence" icon={Globe} risk="LOW" index={index} iconColor="#a855f7">
            {data.success && (
                <div className="space-y-4">

                    {/* IP Addresses */}
                    {aRecords.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">A Records (IP)</p>
                            <div className="space-y-2">
                                {data.ip_info?.slice(0, 2).map((info: any, i: number) => (
                                    <div key={i} className="bg-[#161b22] rounded-lg p-3">
                                        <p className="text-[#00ff88] font-mono text-sm font-bold mb-1">{info.ip}</p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                            {info.org && <p className="text-[#8b949e] text-xs font-mono truncate">{info.org}</p>}
                                            {info.country && <p className="text-[#484f58] text-xs font-mono">{info.city ? `${info.city}, ` : ''}{info.country}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CDN Detection */}
                    {data.cdn && (
                        <div className="flex items-center gap-2 bg-[rgba(0,170,255,0.08)] border border-[rgba(0,170,255,0.2)] rounded-lg p-3">
                            <Shield className="w-4 h-4 text-[#00aaff]" />
                            <div>
                                <p className="text-[#484f58] text-xs font-mono">CDN DETECTED</p>
                                <p className="text-[#00aaff] text-sm font-bold">{data.cdn}</p>
                            </div>
                        </div>
                    )}

                    {/* Hosting */}
                    {data.hosting?.provider && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Hosting Provider</p>
                            <div className="flex items-center gap-2">
                                <Server className="w-3.5 h-3.5 text-[#8b949e]" />
                                <p className="text-[#e6edf3] text-sm">{data.hosting.provider}</p>
                            </div>
                        </div>
                    )}

                    {/* MX Records */}
                    {mxRecords.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">
                                Mail Server
                                {data.mail_provider && <span className="text-[#a855f7] ml-2">({data.mail_provider})</span>}
                            </p>
                            <div className="space-y-1">
                                {mxRecords.slice(0, 2).map((mx: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
                                        <span className="text-[#8b949e] text-xs font-mono truncate">{String(mx.exchange || mx)}</span>
                                        {mx.priority !== undefined && (
                                            <span className="ml-auto text-[#484f58] text-xs font-mono">{mx.priority}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NS Records */}
                    {nsRecords.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Nameservers</p>
                            <div className="space-y-1">
                                {nsRecords.slice(0, 3).map((ns: string, i: number) => (
                                    <p key={i} className="text-[#8b949e] text-xs font-mono truncate">{ns}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TXT SPF */}
                    {data.txt_analysis?.spf && (
                        <div className="bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.1)] rounded-lg p-3">
                            <p className="text-[#00ff88] text-xs font-mono font-bold mb-1">SPF CONFIGURED ✓</p>
                            <p className="text-[#484f58] text-xs font-mono truncate">{data.txt_analysis.spf}</p>
                        </div>
                    )}

                    {/* Record counts */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        {[
                            { label: 'A', count: aRecords.length },
                            { label: 'MX', count: mxRecords.length },
                            { label: 'NS', count: nsRecords.length },
                        ].map(({ label, count }) => (
                            <div key={label} className="bg-[#161b22] rounded-lg p-2 text-center">
                                <p className="text-white font-mono font-bold">{count}</p>
                                <p className="text-[#484f58] text-xs font-mono">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </BaseCard>
    )
}