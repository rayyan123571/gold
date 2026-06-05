import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { useThemeLang } from '@/hooks/useThemeLang'
import { Moon, Sun, Languages } from 'lucide-react'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, register, error, clearError } = useAuthStore()
  const { dark, toggleTheme, toggleLang } = useThemeLang()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (isRegister) {
      if (password !== confirmPassword) {
        useAuthStore.getState().clearError()
        alert('Passwords do not match')
        return
      }
      await register(username, password)
    } else {
      await login(username, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-zinc-950 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={toggleLang}>
          <Languages className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

        <Card className="w-full max-w-md shadow-lg border-amber-200 dark:border-zinc-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-amber-800 dark:text-amber-400">
            {t('app.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                dir="auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
              {isRegister ? t('auth.register') : t('auth.login')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); clearError() }}
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              {isRegister ? t('auth.loginHere') : t('auth.registerHere')}
            </button>
          </p>
        </CardContent>
        </Card>
    </div>
  )
}
