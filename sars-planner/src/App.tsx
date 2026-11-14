import { AutenticacaoProvider } from '@/contexts/AutenticacaoContext'
import { NotificacoesProvider } from '@/contexts/NotificacoesContext'
import { EventosProvider } from '@/contexts/EventosContext'
import { FinanceiroProvider } from '@/contexts/FinanceiroContext'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <AutenticacaoProvider>
      <NotificacoesProvider>
        <EventosProvider>
          <FinanceiroProvider>
            <AppRoutes />
          </FinanceiroProvider>
        </EventosProvider>
      </NotificacoesProvider>
    </AutenticacaoProvider>
  )
}

export default App