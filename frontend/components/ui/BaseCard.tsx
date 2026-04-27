'use client'
import { motion } from 'framer-motion'
import { getRiskColor, getRiskBgClass, getRiskTextClass } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface BaseCardProps {
    title: string
    icon: LucideIcon
    risk?: string
    index?: number
    children: React.ReactNode
    iconColor?: string
    error?: string
}

export default function BaseCard({ title, icon: Icon, risk, index = 0, children, iconColor = '#00ff88', error }: BaseCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl bg-[#0d1117] border border-[rgba(255,255,255,0.04)] card-hover overflow-hidden"
        >
            {/* Card Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${iconColor}15`, border: `1px solid ${iconColor}25` }}
                        >
                            <Icon className="w-5 h-5" style={{ color: iconColor }} />
                        </div>
                        <div>
                            <h3 className="font-display text-white font-semibold text-sm leading-tight">{title}</h3>
                        </div>
                    </div>

                    {risk && (
                        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getRiskBgClass(risk)}`}>
                            <span className={getRiskTextClass(risk)}>{risk}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                {error ? (
                    <div className="text-center py-4">
                        <p className="text-[#8b949e] text-xs font-mono">{error}</p>
                    </div>
                ) : children}
            </div>
        </motion.div>
    )
}