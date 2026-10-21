import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const LayoutPrincipal: React.FC = () => {
  const [menuRecolhido, setMenuRecolhido] = useState<boolean>(false)
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false)

  const alternarRecolhimentoMenu = () => {
    setMenuRecolhido((estadoAnterior) => !estadoAnterior)
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] flex overflow-hidden">
      <Sidebar
        menuRecolhido={menuRecolhido}
        alternarRecolhimentoMenu={alternarRecolhimentoMenu}
        menuMobileAberto={menuMobileAberto}
        fecharMenuMobile={() => setMenuMobileAberto(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header abrirMenuMobile={() => setMenuMobileAberto(true)} />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
