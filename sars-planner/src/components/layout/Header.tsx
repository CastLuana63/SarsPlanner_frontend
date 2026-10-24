import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  Settings,
  User,
  LogOut,
  CheckCheck,
  Flag,
  Check,
  ArrowRight,
  DollarSign,
} from 'lucide-react'
import { useAutenticacao } from '@/contexts/AutenticacaoContext'
import { useNotificacoes } from '@/contexts/NotificacoesContext'
import { SECOES_MENU_LATERAL } from './Sidebar'

interface IHeaderProps {
  abrirMenuMobile: () => void
  estaRolando?: boolean
}

export const Header: React.FC<IHeaderProps> = ({
  abrirMenuMobile,
  estaRolando = false,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuarioLogado, realizarLogout } = useAutenticacao()
  const {
    listaAlertas,
    cincoAlertasMaisRecentes,
    quantidadeNaoLidasRecentes,
    marcarTodasComoLidas,
    marcarAlertaComoLido,
    alternarConclusaoAlerta,
  } = useNotificacoes()

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState<boolean>(false)
  const [notificacaoAberta, setNotificacaoAberta] = useState<boolean>(false)

  const containerDireitoRef = useRef<HTMLDivElement>(null)

  const obterTituloPaginaAtual = (): string => {
    if (location.pathname === '/alertas') return 'Alertas de Pagamento'
    if (location.pathname === '/ajuda') return 'Ajuda'
    if (location.pathname === '/configuracoes') return 'Configurações'

    for (const secao of SECOES_MENU_LATERAL) {
      const itemEncontrado = secao.itens.find(
        (item) => item.caminho === location.pathname
      )
      if (itemEncontrado) {
        return itemEncontrado.tituloTopo
      }
    }
    return 'Tela inicial'
  }

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

  const irParaTelaTodosAlertas = () => {
    setNotificacaoAberta(false)
    navigate('/alertas')
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
    <header
      className={`sticky top-0 z-20 h-14 px-4 sm:px-5 flex items-center justify-between shrink-0 transition-all duration-200 ${estaRolando
          ? 'bg-white/65 backdrop-blur-md border-b border-slate-200/60 shadow-2xs'
          : 'bg-white border-b border-slate-200'
        }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={abrirMenuMobile}
          className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs sm:text-sm font-medium text-slate-500">
          {obterTituloPaginaAtual()}
        </span>
      </div>

      <div ref={containerDireitoRef} className="relative flex items-center gap-2.5">
        <button
          type="button"
          onClick={alternarNotificacoes}
          title="Alertas e Notificações de Pagamento"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {quantidadeNaoLidasRecentes > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1056f5] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              {quantidadeNaoLidasRecentes}
            </span>
          )}
        </button>

        {notificacaoAberta && (
          <div className="absolute right-10 top-11 z-50 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Notificações
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-[#1056f5]">
                  {quantidadeNaoLidasRecentes} recentes
                </span>
              </div>

              <button
                type="button"
                onClick={marcarTodasComoLidas}
                disabled={quantidadeNaoLidasRecentes === 0}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1056f5] hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Ler todas</span>
              </button>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {cincoAlertasMaisRecentes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Nenhum alerta de pagamento no momento.
                </p>
              ) : (
                cincoAlertasMaisRecentes.map((alerta) => (
                  <div
                    key={alerta.id}
                    onClick={() => marcarAlertaComoLido(alerta.id)}
                    className={`p-3 transition-colors cursor-pointer ${alerta.concluida
                        ? 'bg-slate-50/70 opacity-60'
                        : !alerta.lida
                          ? 'bg-blue-50/40 hover:bg-blue-50/70'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!alerta.lida && !alerta.concluida && (
                            <span className="w-2 h-2 rounded-full bg-[#1056f5] shrink-0" />
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {alerta.artista}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            {alerta.cidade_uf}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • Show: {alerta.data_show}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-snug ${alerta.concluida
                              ? 'line-through text-slate-400'
                              : 'text-slate-600'
                            }`}
                        >
                          {alerta.descricao}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => e.preventDefault()}
                          title="Acessar financeiro deste evento (Em breve)"
                          className="p-1.5 rounded-md border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => alternarConclusaoAlerta(alerta.id)}
                          title={
                            alerta.concluida
                              ? 'Notificação concluída'
                              : 'Concluir notificação'
                          }
                          className={`p-1.5 rounded-md border transition cursor-pointer ${alerta.concluida
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-white border-slate-200 text-[#1e3a63] hover:bg-blue-50'
                            }`}
                        >
                          {alerta.concluida ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Flag className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Exibindo {cincoAlertasMaisRecentes.length} de {listaAlertas.length} alertas
              </span>

              <button
                type="button"
                onClick={irParaTelaTodosAlertas}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1056f5] hover:text-blue-700 cursor-pointer"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={alternarMenuUsuario}
          title="Configurações e Conta"
          className="w-8 h-8 rounded-full bg-[#1056f5] text-white text-xs font-bold flex items-center justify-center shadow-xs hover:bg-blue-700 transition cursor-pointer select-none"
        >
          {usuarioLogado?.iniciais || 'AS'}
        </button>

        {menuUsuarioAberto && (
          <div className="absolute right-0 top-11 z-50 w-60 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5">
            <div className="px-3.5 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {usuarioLogado?.nome || 'Administrador'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {usuarioLogado?.email || 'adm@gmail.com'}
              </p>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={irParaConfiguracoes}
                className="w-full px-3.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Configurações</span>
              </button>

              <button
                type="button"
                onClick={irParaConfiguracoes}
                className="w-full px-3.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Meu Perfil</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={manipularLogout}
                className="w-full px-3.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
