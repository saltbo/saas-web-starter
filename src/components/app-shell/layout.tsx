import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { Toaster } from 'sonner'
import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn('rounded-md px-2 py-1 hover:bg-muted', isActive && 'bg-muted font-medium text-foreground')
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout() {
  const { t } = useTranslation()
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <span className="font-heading font-semibold">{t('appName')}</span>
          <nav className="flex gap-1 text-sm text-muted-foreground">
            <NavItem to="/">{t('navNotes')}</NavItem>
            <NavItem to="/about">{t('navAbout')}</NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  )
}
