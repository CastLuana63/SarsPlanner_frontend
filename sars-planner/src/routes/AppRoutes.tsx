import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAutenticacao } from '@/contexts/AutenticacaoContext'
import { LoginPage } from '@/pages/Login/LoginPage'
import { LayoutPrincipal } from '@/components/layout/LayoutPrincipal'
import { InicioPage } from '@/pages/Inicio/InicioPage'
import { EmDesenvolvimentoPage } from '@/pages/EmDesenvolvimento/EmDesenvolvimentoPage'

const RotaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estaAutenticado } = useAutenticacao()
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  const { estaAutenticado } = useAutenticacao()

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Login */}
        <Route
          path="/login"
          element={estaAutenticado ? <Navigate to="/inicio" replace /> : <LoginPage />}
        />

        {/* Rotas Internas Protegidas pelo LayoutPrincipal */}
        <Route
          element={
            <RotaProtegida>
              <LayoutPrincipal />
            </RotaProtegida>
          }
        >
          <Route path="/inicio" element={<InicioPage />} />
          <Route
            path="/eventos"
            element={<EmDesenvolvimentoPage tituloPagina="Eventos" />}
          />
          <Route
            path="/artistas"
            element={<EmDesenvolvimentoPage tituloPagina="Artistas" />}
          />
          <Route
            path="/compartilhar"
            element={<EmDesenvolvimentoPage tituloPagina="Compartilhar" />}
          />
          <Route
            path="/financeira"
            element={<EmDesenvolvimentoPage tituloPagina="Financeira" />}
          />
          <Route
            path="/usuarios"
            element={<EmDesenvolvimentoPage tituloPagina="Usuários" />}
          />
          <Route
            path="/permissoes"
            element={<EmDesenvolvimentoPage tituloPagina="Permissões" />}
          />
          <Route
            path="/ajuda"
            element={<EmDesenvolvimentoPage tituloPagina="Ajuda" />}
          />
          <Route
            path="/configuracoes"
            element={<EmDesenvolvimentoPage tituloPagina="Configurações" />}
          />
        </Route>

        {/* Redirecionamento Padrão */}
        <Route
          path="*"
          element={<Navigate to={estaAutenticado ? '/inicio' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
