'use client'
import { Clock, ExternalLink } from 'lucide-react'
import BaseCard from '@/components/ui/BaseCard'
import { formatDate } from '@/lib/utils'

export default function WaybackCard({ data, index }: { data: any; index: number }) {
    if (!data) return null
    const error = !data.success ? data.error : undefined

    const timeline: { year: number; count: number }[] = data.timeline || []
    const maxCount = Math.max(...timeline.map((t) => t.count), 1)

    return (
        <BaseCard title="Wayback Machine" icon={Clock} index={index} iconColor="#06b6d4">
            {data.success && (
                <div className="space-y-4">

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Total Snapshots</p>
                            <p className="text-white font-bold font-mono text-lg">{(data.total_snapshots || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-[#161b22] rounded-lg p-3">
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-1">Years Active</p>
                            <p className="text-white font-bold font-mono text-lg">{data.years_active || 0}</p>
                        </div>
                    </div>

                    {/* Dates */}
                    {data.first_seen && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[#484f58]">First Seen</span>
                                <span className="text-[#8b949e]">
                                    {data.first_seen ? data.first_seen.substring(0, 4) : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[#484f58]">Last Seen</span>
                                <span className="text-[#8b949e]">
                                    {data.last_seen ? data.last_seen.substring(0, 4) : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Timeline bar chart */}
                    {timeline.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-3">Snapshot Timeline</p>
                            <div className="flex items-end gap-0.5 h-16">
                                {timeline.map((item) => {
                                    const height = Math.max(4, Math.round((item.count / maxCount) * 64))
                                    return (
                                        <div
                                            key={item.year}
                                            className="flex-1 flex flex-col items-center gap-1 group relative"
                                            title={`${item.year}: ${item.count} snapshots`}
                                        >
                                            <div
                                                className="w-full rounded-sm bg-[#06b6d4] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                                style={{ height: `${height}px` }}
                                            />
                                            {/* tooltip on hover */}
                                            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#161b22] border border-[rgba(6,182,212,0.3)] rounded px-2 py-1 text-xs font-mono text-[#06b6d4] whitespace-nowrap z-10">
                                                {item.year}: {item.count}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between text-xs font-mono text-[#484f58] mt-1">
                                <span>{timeline[0]?.year}</span>
                                <span>{timeline[timeline.length - 1]?.year}</span>
                            </div>
                        </div>
                    )}

                    {/* Recent snapshots */}
                    {data.snapshots?.length > 0 && (
                        <div>
                            <p className="text-[#484f58] text-xs font-mono uppercase mb-2">Recent Snapshots</p>
                            <div className="space-y-1.5">
                                {data.snapshots.slice(0, 3).map((snap: any, i: number) => (
                                    <a
                                        key={i}
                                        href={snap.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#161b22] transition-colors group"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] flex-shrink-0" />
                                        <span className="text-[#8b949e] text-xs font-mono flex-1">{snap.date?.substring(0, 10)}</span>
                                        <ExternalLink className="w-3 h-3 text-[#484f58] group-hover:text-[#06b6d4] transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Archive link */}
                    <a
                        href={data.archive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-mono text-[#06b6d4] hover:text-[#22d3ee] transition-colors group"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View all snapshots on Archive.org
                    </a>

                    {data.total_snapshots === 0 && (
                        <div className="bg-[#161b22] rounded-lg p-4 text-center">
                            <p className="text-[#484f58] text-xs font-mono">No archived snapshots found</p>
                        </div>
                    )}
                </div>
            )}
        </BaseCard>
    )
}