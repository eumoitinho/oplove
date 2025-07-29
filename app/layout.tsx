import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/common/providers"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OpenLove - Rede Social do Amor",
  description: "A rede social brasileira para encontros, relacionamentos e conexões autênticas.",
  keywords: ["rede social", "relacionamentos", "encontros", "amor", "brasil"],
  authors: [{ name: "OpenLove Team" }],
  creator: "OpenLove",
  publisher: "OpenLove",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://openlove.com.br"),
  openGraph: {
    title: "OpenLove - Rede Social do Amor",
    description: "A rede social brasileira para encontros, relacionamentos e conexões autênticas.",
    url: "https://openlove.com.br",
    siteName: "OpenLove",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OpenLove - Rede Social do Amor",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenLove - Rede Social do Amor",
    description: "A rede social brasileira para encontros, relacionamentos e conexões autênticas.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
