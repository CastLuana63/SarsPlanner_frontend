import { AutenticacaoProvider } from '@/contexts/AutenticacaoContext'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <AutenticacaoProvider>
      <AppRoutes />
    </AutenticacaoProvider>
  )
}

export default App