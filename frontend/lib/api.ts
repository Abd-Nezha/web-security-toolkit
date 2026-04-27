import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function runFullScan(domain: string) {
    const response = await api.post('/scan', { domain })
    return response.data
}

export async function inspectSSL(domain: string) {
    const response = await api.get('/ssl/inspect', { params: { domain } })
    return response.data
}

export async function auditHeaders(domain: string) {
    const response = await api.get('/headers/audit', { params: { domain } })
    return response.data
}

export async function scanVulnerabilities(domain: string) {
    const response = await api.get('/vulnerabilities/scan', { params: { domain } })
    return response.data
}

export async function lookupDNS(domain: string) {
    const response = await api.get('/dns/lookup', { params: { domain } })
    return response.data
}

export async function checkReputation(domain: string) {
    const response = await api.get('/reputation/check', { params: { domain } })
    return response.data
}

export async function scanPorts(domain: string) {
    const response = await api.get('/ports/scan', { params: { domain } })
    return response.data
}

export async function getWaybackHistory(domain: string) {
    const response = await api.get('/wayback/history', { params: { domain } })
    return response.data
}

export async function getWhoisInfo(domain: string) {
    const response = await api.get('/whois/info', { params: { domain } })
    return response.data
}

export async function getBlacklistHistory(domain: string) {
    const response = await api.get('/blacklist/history', { params: { domain } })
    return response.data
}