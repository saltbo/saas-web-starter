import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getToken, login } from '@/lib/auth/oidc'

export default function LoginPage() {
  const { t } = useTranslation()
  if (getToken()) return <Navigate to="/" replace />

  return (
    <div className="grid min-h-dvh place-items-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-heading text-xl font-semibold">{t('appName')}</h1>
        <Button
          onClick={() => {
            void login()
          }}
        >
          {t('signIn')}
        </Button>
      </div>
    </div>
  )
}
