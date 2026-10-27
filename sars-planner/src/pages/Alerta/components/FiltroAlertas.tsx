import React, { useState, useRef, useEffect } from 'react'
import {
    Filter,
    FilterX,
    MoreVertical,
    FileSpreadsheet,
    Printer,
    Search,
    ChevronDown,
    Check,
} from 'lucide-react'
import type {
    IFiltrosAlertas,
    TStatusFiltroConclusao,
} from '@/types/notificacao.types'

export const OPCOES_MESES_SELECT = [
    { valor: '01', rotulo: 'Janeiro', curto: 'Jan' },
    { valor: '02', rotulo: 'Fevereiro', curto: 'Fev' },
    { valor: '03', rotulo: 'Março', curto: 'Mar' },
    { valor: '04', rotulo: 'Abril', curto: 'Abr' },
    { valor: '05', rotulo: 'Maio', curto: 'Mai' },
    { valor: '06', rotulo: 'Junho', curto: 'Jun' },
    { valor: '07', rotulo: 'Julho', curto: 'Jul' },
    { valor: '08', rotulo: 'Agosto', curto: 'Ago' },
    { valor: '09', rotulo: 'Setembro', curto: 'Set' },
    { valor: '10', rotulo: 'Outubro', curto: 'Out' },
    { valor: '11', rotulo: 'Novembro', curto: 'Nov' },
    { valor: '12', rotulo: 'Dezembro', curto: 'Dez' },
]

interface IFiltroAlertasProps {
    filtros: IFiltrosAlertas
    opcoesAnos: string[]
    totalFiltrados: number
    quantidadeFiltrosColunaAtivos: number
    aoAlterarCampo: <K extends keyof IFiltrosAlertas>(
        campo: K,
        valor: IFiltrosAlertas[K]
    ) => void
    aoFiltrar: () => void
    aoLimpar: () => void
    aoExportarCsv: () => void
    aoExportarPdf: () => void
}

export const FiltroAlertas: React.FC<IFiltroAlertasProps> = ({
    filtros,
    opcoesAnos,
    totalFiltrados,
    quantidadeFiltrosColunaAtivos,
    aoAlterarCampo,
    aoFiltrar,
    aoLimpar,
    aoExportarCsv,
    aoExportarPdf,
}) => {
    const [menuMesesAberto, setMenuMesesAberto] = useState<boolean>(false)
    const [menuExportacaoAberto, setMenuExportacaoAberto] = useState<boolean>(false)

    const menuMesesRef = useRef<HTMLDivElement>(null)
    const menuOpcoesRef = useRef<HTMLDivElement>(null)
    const anoAtualSistema = String(new Date().getFullYear())

    useEffect(() => {
        const manipularCliqueFora = (evento: MouseEvent) => {
            if (
                menuMesesRef.current &&
                !menuMesesRef.current.contains(evento.target as Node)
            ) {
                setMenuMesesAberto(false)
            }
            if (
                menuOpcoesRef.current &&
                !menuOpcoesRef.current.contains(evento.target as Node)
            ) {
                setMenuExportacaoAberto(false)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const manipularSubmit = (evento: React.FormEvent) => {
        evento.preventDefault()
        aoFiltrar()
    }

    const alternarSelecaoMes = (valorMes: string) => {
        const jaSelecionado = filtros.meses.includes(valorMes)
        const novaLista = jaSelecionado
            ? filtros.meses.filter((m) => m !== valorMes)
            : [...filtros.meses, valorMes].sort()
        aoAlterarCampo('meses', novaLista)
    }

    const obterResumoMesesSelecionados = (): string => {
        if (filtros.meses.length === 0 || filtros.meses.length === 12) {
            return 'Meses: Todos (Jan–Dez)'
        }
        if (filtros.meses.length <= 2) {
            const nomes = filtros.meses.map(
                (m) => OPCOES_MESES_SELECT.find((op) => op.valor === m)?.curto || m
            )
            return `Meses: ${nomes.join(', ')}`
        }
        return `Meses: ${filtros.meses.length} selecionados`
    }

    const classesControleCompacto =
        'h-8 rounded-lg border border-slate-300 bg-slate-50/60 px-2.5 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none transition-colors'

    return (
        <form
            onSubmit={manipularSubmit}
            className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] print:hidden"
        >
            <div className="flex flex-wrap items-center gap-2">
                {/* 1. Select de Ano */}
                <select
                    value={filtros.ano}
                    onChange={(e) => aoAlterarCampo('ano', e.target.value)}
                    aria-label="Selecionar Ano"
                    className={`${classesControleCompacto} w-full sm:w-36 cursor-pointer`}
                >
                    <option value="TODOS">Ano: Todos</option>
                    {opcoesAnos.map((anoItem) => (
                        <option key={anoItem} value={anoItem}>
                            Ano: {anoItem} {anoItem === anoAtualSistema ? '(Atual)' : ''}
                        </option>
                    ))}
                </select>

                {/* 2. Multi-Select de Meses (Permite selecionar mais de um mês) */}
                <div ref={menuMesesRef} className="relative w-full sm:w-48">
                    <button
                        type="button"
                        onClick={() => setMenuMesesAberto((aberto) => !aberto)}
                        className={`${classesControleCompacto} w-full flex items-center justify-between gap-1.5 cursor-pointer ${filtros.meses.length > 0
                                ? 'border-[#1056f5] bg-blue-50/40 text-[#1056f5] font-semibold'
                                : ''
                            }`}
                    >
                        <span className="truncate">{obterResumoMesesSelecionados()}</span>
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </button>

                    {menuMesesAberto && (
                        <div className="absolute left-0 top-9 z-40 w-60 rounded-xl bg-white shadow-xl border border-slate-200 p-2.5 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Selecionar Meses
                                </span>
                                <button
                                    type="button"
                                    onClick={() => aoAlterarCampo('meses', [])}
                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                >
                                    Todos (Limpar)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
                                {OPCOES_MESES_SELECT.map((mesObj) => {
                                    const selecionado = filtros.meses.includes(mesObj.valor)
                                    return (
                                        <button
                                            key={mesObj.valor}
                                            type="button"
                                            onClick={() => alternarSelecaoMes(mesObj.valor)}
                                            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] transition cursor-pointer ${selecionado
                                                    ? 'bg-blue-50 text-[#1056f5] font-semibold'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            <span
                                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${selecionado
                                                        ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                        : 'border-slate-300 bg-white'
                                                    }`}
                                            >
                                                {selecionado && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </span>
                                            <span className="truncate">{mesObj.rotulo}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Select de Status */}
                <select
                    value={filtros.statusConclusao}
                    onChange={(e) =>
                        aoAlterarCampo(
                            'statusConclusao',
                            e.target.value as TStatusFiltroConclusao
                        )
                    }
                    aria-label="Status do Alerta"
                    className={`${classesControleCompacto} w-full sm:w-44 cursor-pointer`}
                >
                    <option value="NAO_CONCLUIDO">Status: Não Concluído</option>
                    <option value="CONCLUIDO">Status: Concluído</option>
                    <option value="TODOS">Status: Todos</option>
                </select>

                {/* 4. Pesquisa Geral (Qualquer texto presente nas células) */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Pesquisar qualquer texto nas células..."
                        value={filtros.pesquisaGeral}
                        onChange={(e) => aoAlterarCampo('pesquisaGeral', e.target.value)}
                        className={`${classesControleCompacto} w-full pl-8 pr-2.5`}
                    />
                </div>

                {/* 5. Botões de Ação: Filtrar, Limpar (Todos) e 3 Pontos (Exportar) */}
                <div className="flex items-center gap-1.5 ml-auto">
                    <span className="hidden xl:inline-block text-[10.5px] text-slate-400 mr-1">
                        Total: <strong className="text-slate-700">{totalFiltrados}</strong>
                    </span>

                    <button
                        type="submit"
                        className="h-8 inline-flex items-center justify-center gap-1 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-2.5 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                    >
                        <Filter className="w-3 h-3" />
                        <span>Filtrar</span>
                    </button>

                    <button
                        type="button"
                        onClick={aoLimpar}
                        title="Limpar filtros do topo e das colunas"
                        className="h-8 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-2.5 text-[11px] font-semibold transition cursor-pointer"
                    >
                        <FilterX className="w-3 h-3 text-slate-400" />
                        <span>Limpar</span>
                        {quantidadeFiltrosColunaAtivos > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1056f5] text-[9.5px] font-bold">
                                {quantidadeFiltrosColunaAtivos}
                            </span>
                        )}
                    </button>

                    {/* Botão de 3 Pontos (Exportação CSV e PDF) */}
                    <div ref={menuOpcoesRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuExportacaoAberto((aberto) => !aberto)}
                            title="Exportar dados"
                            aria-label="Exportar dados"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuExportacaoAberto && (
                            <div className="absolute right-0 top-9 z-40 w-40 rounded-xl bg-white shadow-lg border border-slate-200 py-1">
                                <div className="px-3 py-1 border-b border-slate-100">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                                        Exportar Dados
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarCsv()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Exportar CSV</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarPdf()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                    <span>Exportar PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    )
}
