'use client'
import { motion } from 'framer-motion'

export default function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className="rounded-xl bg-[#0d1117] border border-[rgba(255,255,255,0.04)] p-5 overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2.5">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
                <div className="skeleton h-3 w-3/5 rounded" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="skeleton h-16 rounded-lg" />
                <div className="skeleton h-16 rounded-lg" />
            </div>
        </motion.div>
    )
}