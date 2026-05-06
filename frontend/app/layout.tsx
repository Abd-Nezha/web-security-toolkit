import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Web Security Intelligence',
    description: 'Professional-grade website security analysis, domain intelligence, and threat detection platform',
    keywords: 'security, ssl, dns, vulnerability scanner, domain reputation, port scanner',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}