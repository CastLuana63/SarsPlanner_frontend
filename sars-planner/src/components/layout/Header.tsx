import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Settings, User, LogOut } from 'lucide-react'
import { useAutenticacao } from '@/contexts/AutenticacaoContext'
import { SECOES_MENU_LATERAL } from './Sidebar'

interface IHeaderProps {
  abrirMenuMobile: () => void
}

export const Header: React.FC<IHeaderProps> = ({ abrirMenuMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuarioLogado, realizarLogout } = useAutenticacao()

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState<boolean>(false)
  const [notificacaoAberta, setNotificacaoAberta] = useState<boolean>(false)

  const containerDireitoRef = useRef<HTMLDivElement>(null)

  // Obtém o título da página atual com base na rota ativa
  const obterTituloPaginaAtual = (): string => {
    if (location.pathname === '/ajuda') return 'Ajuda'
    if (location.pathname === '/configuracoes') return 'Configurações'

    for (const secao of SECOES_MENU_LATERAL) {
      const itemEncontrado = secao.itens.find((item) => item.caminho === location.pathname)
      if (itemEncontrado) {
        return itemEncontrado.tituloTopo
      }
    }
    return 'Tela inicial'
  }

  // Fecha os dropdowns ao clicar fora
  useEffect(() => {
    const manipularCliqueFora = (evento: MouseEvent) => {
      if (
        containerDireitoRef.current &&
        !containerDireitoRef.current.contains(evento.target as Node)
      ) {
        setMenuUsuarioAberto(false)
        setNotificacaoAberta(false)
      }
    }
    document.addEventListener('mousedown', manipularCliqueFora)
    return () => document.removeEventListener('mousedown', manipularCliqueFora)
  }, [])

  const alternarNotificacoes = () => {
    setNotificacaoAberta((estadoAnterior) => !estadoAnterior)
    setMenuUsuarioAberto(false)
  }

  const alternarMenuUsuario = () => {
    setMenuUsuarioAberto((estadoAnterior) => !estadoAnterior)
    setNotificacaoAberta(false)
  }

  const irParaConfiguracoes = () => {
    setMenuUsuarioAberto(false)
    navigate('/configuracoes')
  }

  const manipularLogout = () => {
    setMenuUsuarioAberto(false)
    realizarLogout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Lado Esquerdo: Botão Mobile + Título da Tela */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={abrirMenuMobile}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm sm:text-base font-medium text-slate-500">
          {obterTituloPaginaAtual()}
        </span>
      </div>

      {/* Lado Direito: Ícone de Notificação (à esquerda) + Avatar do Usuário com Configurações */}
      <div ref={containerDireitoRef} className="relative flex items-center gap-3">
        {/* Botão de Notificação posicionado à esquerda do ícone do usuário */}
        <button
          type="button"
          onClick={alternarNotificacoes}
          title="Notificações"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#1056f5] ring-2 ring-white" />
        </button>

        {/* Dropdown de Notificações */}
        {notificacaoAberta && (
          <div className="absolute right-12 top-12 z-50 w-72 rounded-xl bg-white shadow-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Notificações
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Recentes</span>
            </div>
            <p className="text-xs text-slate-500 text-center py-4">
              Central de notificações em desenvolvimento.
            </p>
          </div>
        )}

        {/* Ícone Circular do Usuário */}
        <button
          type="button"
          onClick={alternarMenuUsuario}
          title="Configurações e Conta"
          className="w-10 h-10 rounded-full bg-[#1056f5] text-white text-sm font-bold flex items-center justify-center shadow-xs hover:bg-blue-700 transition cursor-pointer select-none"
        >
          {usuarioLogado?.iniciais || 'AS'}
        </button>

        {/* Dropdown de Configuração do Usuário */}
        {menuUsuarioAberto && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-xl bg-white shadow-lg border border-slate-200 py-2">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {usuarioLogado?.nome || 'Administrador'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {usuarioLogado?.email || 'adm@gmail.com'}
              </p>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={irParaConfiguracoes}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Configurações</span>
              </button>

              <button
                type="button"
                onClick={irParaConfiguracoes}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Meu Perfil</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={manipularLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
