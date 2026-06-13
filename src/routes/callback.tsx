import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { completeLogin } from '@/lib/auth/oidc'

export default function CallbackPage() {
  const navigate = useNavigate()
  useEffect(() => {
    completeLogin()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  return <div className="grid min-h-dvh place-items-center text-muted-foreground text-sm">Signing in…</div>
}
