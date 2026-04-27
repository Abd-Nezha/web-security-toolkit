export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'

export function getRiskColor(risk: RiskLevel | string): string {
    switch (risk?.toUpperCase()) {
        case 'CRITICAL': return '#ef4444'
        case 'HIGH': return '#f97316'
        case 'MEDIUM': return '#eab308'
        case 'LOW': return '#22c55e'
        default: return '#6b7280'
    }
}

export function getRiskBgClass(risk: RiskLevel | string): string {
    switch (risk?.toUpperCase()) {
        case 'CRITICAL': return 'risk-bg-critical'
        case 'HIGH': return 'risk-bg-high'
        case 'MEDIUM': return 'risk-bg-medium'
        case 'LOW': return 'risk-bg-low'
        default: return 'risk-bg-unknown'
    }
}

export function getRiskTextClass(risk: RiskLevel | string): string {
    switch (risk?.toUpperCase()) {
        case 'CRITICAL': return 'risk-critical'
        case 'HIGH': return 'risk-high'
        case 'MEDIUM': return 'risk-medium'
        case 'LOW': return 'risk-low'
        default: return 'risk-unknown'
    }
}

export function getRiskLabel(risk: RiskLevel | string): string {
    switch (risk?.toUpperCase()) {
        case 'CRITICAL': return '🔴 Critical'
        case 'HIGH': return '🟠 High'
        case 'MEDIUM': return '🟡 Medium'
        case 'LOW': return '🟢 Low'
        default: return '⚫ Unknown'
    }
}

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A'
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        })
    } catch {
        return dateStr
    }
}

export function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    if (score >= 40) return '#f97316'
    return '#ef4444'
}