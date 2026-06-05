import { useAuthStore } from '@/stores/authStore'
import { LoginPage } from '@/components/LoginPage'
import { MainPage } from '@/components/MainPage'

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <MainPage />
}

export default App
