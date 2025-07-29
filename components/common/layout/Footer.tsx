"use client"
import Link from "next/link"
import { Heart, Instagram, Twitter, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FooterProps {
  className?: string
  variant?: "default" | "minimal"
}

/**
 * Application footer with links and social media
 *
 * @example
 * ```tsx
 * <Footer variant="default" className="mt-auto" />
 * <Footer variant="minimal" />
 * ```
 */
export function Footer({ className, variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: "Sobre", href: "/about" },
      { label: "Carreiras", href: "/careers" },
      { label: "Imprensa", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
    support: [
      { label: "Central de Ajuda", href: "/help" },
      { label: "Segurança", href: "/safety" },
      { label: "Diretrizes", href: "/guidelines" },
      { label: "Contato", href: "/contact" },
    ],
    legal: [
      { label: "Termos de Uso", href: "/terms" },
      { label: "Política de Privacidade", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "LGPD", href: "/lgpd" },
    ],
    premium: [
      { label: "OpenLove Gold", href: "/premium/gold" },
      { label: "OpenLove Diamond", href: "/premium/diamond" },
      { label: "Para Casais", href: "/premium/couple" },
      { label: "Empresas", href: "/business" },
    ],
  }

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com/openlove", icon: Instagram },
    { label: "Twitter", href: "https://twitter.com/openlove", icon: Twitter },
    { label: "Facebook", href: "https://facebook.com/openlove", icon: Facebook },
  ]

  if (variant === "minimal") {
    return (
      <footer className={cn("border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-900", className)}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} OpenLove. Feito com amor no Brasil.
              </span>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={cn("border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900", className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                OpenLove
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A rede social brasileira que conecta pessoas através do amor e da autenticidade.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-purple-600 hover:text-white transition-all dark:bg-gray-700 dark:text-gray-400"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Suporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Premium</h3>
            <ul className="space-y-2">
              {footerLinks.premium.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} OpenLove. Todos os direitos reservados. Feito com{" "}
              <Heart className="inline h-4 w-4 text-red-500" /> no Brasil.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Versão 1.0.0</span>
              <span>•</span>
              <Link href="/status" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Status do Sistema
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
