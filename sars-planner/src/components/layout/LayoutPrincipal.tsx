import React, { useState, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const LayoutPrincipal: React.FC = () => {
  const [menuRecolhido, setMenuRecolhido] = useState<boolean>(false)
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false)
  const [estaRolando, setEstaRolando] = useState<boolean>(false)

  const containerRolagemRef = useRef<HTMLDivElement>(null)

  const alternarRecolhimentoMenu = () => {
    setMenuRecolhido((estadoAnterior) => !estadoAnterior)
  }

  const manipularRolagemConteudo = (evento: React.UIEvent<HTMLDivElement>) => {
    const posicaoVertical = evento.currentTarget.scrollTop
    setEstaRolando(posicaoVertical > 8)
  }

  return (
    <div className="h-screen w-full bg-[#f4f6f8] flex overflow-hidden">
      <Sidebar
        menuRecolhido={menuRecolhido}
        alternarRecolhimentoMenu={alternarRecolhimentoMenu}
        menuMobileAberto={menuMobileAberto}
        fecharMenuMobile={() => setMenuMobileAberto(false)}
      />

      <div
        ref={containerRolagemRef}
        onScroll={manipularRolagemConteudo}
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scroll-smooth"
      >
        <Header
          abrirMenuMobile={() => setMenuMobileAberto(true)}
          estaRolando={estaRolando}
        />

        <main className="flex-1 p-4 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
