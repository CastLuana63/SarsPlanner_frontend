import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  CalendarDays,
  Mic2,
  Share2,
  DollarSign,
  Users,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAutenticacao } from '@/contexts/AutenticacaoContext'
import type { IItemMenuLateral, ISecaoMenuLateral } from '@/types/navegacao.types'

export const SECOES_MENU_LATERAL: ISecaoMenuLateral[] = [
  {
    idSecao: 'principal',
    tituloSecao: 'PRINCIPAL',
    itens: [
      {
        id: 'inicio',
        rotulo: 'Início',
        tituloTopo: 'Tela inicial',
        descricao: 'Visão geral do sistema e atalhos rápidos de navegação.',
        caminho: '/inicio',
        icone: Home,
      },
    ],
  },
  {
    idSecao: 'operacoes',
    tituloSecao: 'OPERAÇÕES',
    itens: [
      {
        id: 'eventos',
        rotulo: 'Eventos',
        tituloTopo: 'Eventos',
        descricao: 'Planejamento, cronograma e controle de eventos ativos.',
        caminho: '/eventos',
        icone: Calendar,
      },
      {
        id: 'artistas',
        rotulo: 'Artistas',
        tituloTopo: 'Artistas',
        descricao: 'Cadastro de artistas, contatos, agendas e vínculos.',
        caminho: '/artistas',
        icone: Mic2,
      },
      {
        id: 'compartilhar',
        rotulo: 'Compartilhar',
        tituloTopo: 'Compartilhar',
        descricao: 'Compartilhamento de agendas, links externos e materiais.',
        caminho: '/compartilhar',
        icone: Share2,
      },
      {
        id: 'financeira',
        rotulo: 'Financeira',
        tituloTopo: 'Financeira',
        descricao: 'Acompanhamento de cachês, custos operacionais e receitas.',
        caminho: '/financeira',
        icone: DollarSign,
      },
      {
        id: 'agenda',
        rotulo: 'Agenda',
        tituloTopo: 'Agenda',
        descricao: 'Calendário interativo de datas, horários e status de shows.',
        caminho: '/agenda',
        icone: CalendarDays,
      },
    ],
  },
  {
    idSecao: 'administracao',
    tituloSecao: 'ADMINISTRAÇÃO',
    itens: [
      {
        id: 'usuarios',
        rotulo: 'Usuários',
        tituloTopo: 'Usuários',
        descricao: 'Gerenciamento de contas, acessos e equipe interna.',
        caminho: '/usuarios',
        icone: Users,
      },
      {
        id: 'permissoes',
        rotulo: 'Permissões',
        tituloTopo: 'Permissões',
        descricao: 'Controle de perfis de acesso e regras de segurança.',
        caminho: '/permissoes',
        icone: ShieldCheck,
      },
    ],
  },
]

export const ITEM_MENU_AJUDA: IItemMenuLateral = {
  id: 'ajuda',
  rotulo: 'Ajuda',
  tituloTopo: 'Ajuda',
  descricao: 'Suporte técnico, orientações de uso e documentação.',
  caminho: '/ajuda',
  icone: HelpCircle,
}

interface ISidebarProps {
  menuRecolhido: boolean
  alternarRecolhimentoMenu: () => void
  menuMobileAberto: boolean
  fecharMenuMobile: () => void
}

export const Sidebar: React.FC<ISidebarProps> = ({
  menuRecolhido,
  alternarRecolhimentoMenu,
  menuMobileAberto,
  fecharMenuMobile,
}) => {
  const navigate = useNavigate()
  const { realizarLogout } = useAutenticacao()

  const manipularSaida = () => {
    realizarLogout()
    fecharMenuMobile()
    navigate('/login')
  }

  return (
    <>
      {menuMobileAberto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={fecharMenuMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen shrink-0 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 lg:static lg:translate-x-0 ${menuMobileAberto ? 'translate-x-0 w-56' : '-translate-x-full'
          } ${menuRecolhido ? 'lg:w-16' : 'lg:w-56'}`}
      >
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-200 shrink-0">
          {!menuRecolhido ? (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                SarsPlanner
              </h2>
              <p className="text-[11px] text-slate-500 truncate leading-tight">
                Soluções em tecnologia
              </p>
            </div>
          ) : (
            <div className="mx-auto font-black text-sm text-[#1056f5]">SP</div>
          )}

          <button
            type="button"
            onClick={alternarRecolhimentoMenu}
            title={menuRecolhido ? 'Expandir menu' : 'Recolher menu'}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            {menuRecolhido ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={fecharMenuMobile}
            className="flex lg:hidden items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {SECOES_MENU_LATERAL.map((secao) => (
            <div key={secao.idSecao} className="space-y-1">
              {!menuRecolhido && (
                <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {secao.tituloSecao}
                </span>
              )}

              <div className="space-y-0.5">
                {secao.itens.map((item) => {
                  const IconeComponente = item.icone
                  return (
                    <NavLink
                      key={item.id}
                      to={item.caminho}
                      onClick={fecharMenuMobile}
                      title={menuRecolhido ? item.rotulo : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-[13px] font-medium transition-colors ${menuRecolhido ? 'justify-center' : ''
                        } ${isActive
                          ? 'bg-[#1056f5] text-white font-semibold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <IconeComponente className="w-4 h-4 shrink-0" />
                      {!menuRecolhido && <span className="truncate">{item.rotulo}</span>}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-2.5 space-y-0.5 shrink-0">
          <NavLink
            to={ITEM_MENU_AJUDA.caminho}
            onClick={fecharMenuMobile}
            title={menuRecolhido ? ITEM_MENU_AJUDA.rotulo : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-[13px] font-medium transition-colors ${menuRecolhido ? 'justify-center' : ''
              } ${isActive
                ? 'bg-[#1056f5] text-white font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!menuRecolhido && <span>{ITEM_MENU_AJUDA.rotulo}</span>}
          </NavLink>

          <button
            type="button"
            onClick={manipularSaida}
            title={menuRecolhido ? 'Sair' : undefined}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-[13px] font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer ${menuRecolhido ? 'justify-center' : ''
              }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!menuRecolhido && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
