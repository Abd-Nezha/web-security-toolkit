'use client'
import { Terminal } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { getRiskTextClass, getRiskColor } from '@/lib/utils'

export default function PortsCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const openPorts = (data.ports || []).filter((p: any) => p.state === 'OPEN')
    const criticalOpen = openPorts.filter((p: any) => p.risk === 'CRITICAL')
    const highOpen = openPorts.filter((p: any) => p.risk === 'HIGH')

    return (
        <BaseCard title="Port Health Scanner" icon={Terminal} risk={data.overall_risk} index={index} iconColor="#ef4444">
            {data.success && (
                <div className="space-y-4">

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#161b22] rounded-lg p-3 text-center">
                            <p className="text-[#22c55e] font-bold font-mono text-lg">{data.summary?.open}</p>
                            <p className="text-[#484f58] text-xs font-mono">OPEN</p>
                        </div>
                        <div className="bg-[#161b22] rounded-lg p-3 text-center">
                            <p className="text-[#8b949e] font-bold font-mono text-lg">{data.summary?.closed}</p>
                            <p className="text-[#484f58] text-xs font-mono">CLOSED</p>
                        </div>
                        <div className="bg-[#161b22] rounded-lg p-3 text-center">
                            <p className="text-[#484f58] font-bold font-mono text-lg">{data.summary?.filtered}</p>
                            <p className="text-[#484f58] text-xs font-mono">FILTERED</p>
                        </div>
                    </div>

                    {/* Critical alerts */}
                    {data.critical_alerts?.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">⚠ Critical Open Ports</p>
                            <div className="space-y-1.5">
                                {data.critical_alerts.map((alert: any) => (
                                    <div key={alert.port} className="flex items-start gap-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg p-2.5">
                                        <span className="text-[#ef4444] font-mono text-sm font-bold min-w-[40px]">{alert.port}</span>
                                        <div>
                                            <p className="text-[#ef4444] text-xs font-bold">{alert.service}</p>
                                            <p className="text-[#8b949e] text-xs">{alert.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All open ports list */}
                    {openPorts.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Open Ports ({openPorts.length})</p>
                            <div className="space-y-1">
                                {openPorts.map((port: any) => (
                                    <div key={port.port} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-[#161b22] transition-colors">
                                        <span className="font-mono text-xs text-[#e6edf3] min-w-[48px]">{port.port}</span>
                                        <span className="text-[#8b949e] text-xs flex-1">{port.service}</span>
                                        <span
                                            className="text-xs font-mono font-bold"
                                            style={{ color: getRiskColor(port.risk) }}
                                        >
                                            {port.risk}
                                        </span>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRiskColor(port.risk) }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {openPorts.length === 0 && (
                        <div className="bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] rounded-lg p-4 text-center">
                            <p className="text-[#22c55e] text-sm font-mono">No risky open ports detected</p>
                            <p className="text-[#484f58] text-xs font-mono mt-1">All {data.summary?.total_scanned} ports scanned</p>
                        </div>
                    )}

                    {/* IP */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[rgba(255,255,255,0.04)]">
                        <p className="text-[#484f58] text-xs font-mono">IP:</p>
                        <p className="text-[#8b949e] text-xs font-mono">{data.ip}</p>
                    </div>
                </div>
            )}
        </BaseCard>
    )
}