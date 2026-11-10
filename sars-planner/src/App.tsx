import { AutenticacaoProvider } from '@/contexts/AutenticacaoContext'
import { NotificacoesProvider } from '@/contexts/NotificacoesContext'
import { EventosProvider } from '@/contexts/EventosContext'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <AutenticacaoProvider>
      <NotificacoesProvider>
        <EventosProvider>
          <AppRoutes />
        </EventosProvider>
      </NotificacoesProvider>
    </AutenticacaoProvider>
  )
}

export default App
