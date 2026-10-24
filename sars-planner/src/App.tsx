import { AutenticacaoProvider } from '@/contexts/AutenticacaoContext'
import { NotificacoesProvider } from '@/contexts/NotificacoesContext'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <AutenticacaoProvider>
      <NotificacoesProvider>
        <AppRoutes />
      </NotificacoesProvider>
    </AutenticacaoProvider>
  )
}

export default App
