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
    SlidersHorizontal,
} from 'lucide-react'
import { OPCOES_MESES_SELECT } from '@/pages/Alerta/components/FiltroAlertas'
import type { IFiltrosCompartilhar } from '@/types/compartilhar.types'

interface IFiltroCompartilharProps {
    filtros: IFiltrosCompartilhar
    opcoesArtistas: string[]
    opcoesAnos: string[]
    opcoesStatus: string[]
    totalFiltrados: number
    totalColunasSelecionadas: number
    quantidadeFiltrosColunaAtivos: number
    seletorColunasAberto: boolean
    aoAlternarSeletorColunas: () => void
    aoAlterarCampo: <K extends keyof IFiltrosCompartilhar>(
        campo: K,
        valor: IFiltrosCompartilhar[K]
    ) => void
    aoFiltrar: () => void
    aoLimpar: () => void
    aoExportarCsv: () => void
    aoExportarXlsx: () => void
    aoExportarPdf: () => void
}

export const FiltroCompartilhar: React.FC<IFiltroCompartilharProps> = ({
    filtros,
    opcoesArtistas,
    opcoesAnos,
    opcoesStatus,
    totalFiltrados,
    totalColunasSelecionadas,
    quantidadeFiltrosColunaAtivos,
    seletorColunasAberto,
    aoAlternarSeletorColunas,
    aoAlterarCampo,
    aoFiltrar,
    aoLimpar,
    aoExportarCsv,
    aoExportarXlsx,
    aoExportarPdf,
}) => {
    const [menuMesesAberto, setMenuMesesAberto] = useState(false)
    const [menuExportacaoAberto, setMenuExportacaoAberto] = useState(false)

    const menuMesesRef = useRef<HTMLDivElement>(null)
    const menuOpcoesRef = useRef<HTMLDivElement>(null)
    const anoAtualSistema = String(new Date().getFullYear())

    useEffect(() => {
        const manipularCliqueFora = (e: MouseEvent) => {
            if (
                menuMesesRef.current &&
                !menuMesesRef.current.contains(e.target as Node)
            ) {
                setMenuMesesAberto(false)
            }
            if (
                menuOpcoesRef.current &&
                !menuOpcoesRef.current.contains(e.target as Node)
            ) {
                setMenuExportacaoAberto(false)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const alternarSelecaoMes = (valorMes: string) => {
        const jaExiste = filtros.meses.includes(valorMes)
        const novaLista = jaExiste
            ? filtros.meses.filter((m) => m !== valorMes)
            : [...filtros.meses, valorMes].sort()
        aoAlterarCampo('meses', novaLista)
    }

    const obterResumoMeses = (): string => {
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

    const classeControle =
        'h-8 rounded-lg border border-slate-300 bg-slate-50/60 px-2.5 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none transition-colors'

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                aoFiltrar()
            }}
            className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] print:hidden"
        >
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={aoAlternarSeletorColunas}
                    title="Escolher quais campos de Evento, Financeiro e Artistas aparecem na grid"
                    className={`h-8 inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition cursor-pointer ${seletorColunasAberto
                        ? 'bg-[#1056f5] text-white border-[#1056f5]'
                        : 'bg-blue-50 text-[#1056f5] border-blue-200 hover:bg-blue-100'
                        }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Editar Colunas ({totalColunasSelecionadas})</span>
                </button>

                <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Filtro geral em qualquer célula visível..."
                        value={filtros.pesquisaGeral}
                        onChange={(e) => aoAlterarCampo('pesquisaGeral', e.target.value)}
                        className={`${classeControle} w-full pl-8 pr-2.5`}
                    />
                </div>

                <select
                    value={filtros.artistaTopo}
                    onChange={(e) => aoAlterarCampo('artistaTopo', e.target.value)}
                    className={`${classeControle} w-full sm:w-36 cursor-pointer`}
                >
                    <option value="TODOS">Artista: Todos</option>
                    {opcoesArtistas.map((art) => (
                        <option key={art} value={art}>
                            Artista: {art}
                        </option>
                    ))}
                </select>

                <select
                    value={filtros.ano}
                    onChange={(e) => aoAlterarCampo('ano', e.target.value)}
                    className={`${classeControle} w-full sm:w-34 cursor-pointer`}
                >
                    <option value="TODOS">Ano: Todos</option>
                    {opcoesAnos.map((ano) => (
                        <option key={ano} value={ano}>
                            Ano: {ano} {ano === anoAtualSistema ? '(Atual)' : ''}
                        </option>
                    ))}
                </select>

                <div ref={menuMesesRef} className="relative w-full sm:w-44">
                    <button
                        type="button"
                        onClick={() => setMenuMesesAberto((v) => !v)}
                        className={`${classeControle} w-full flex items-center justify-between gap-1.5 cursor-pointer ${filtros.meses.length > 0
                            ? 'border-[#1056f5] bg-blue-50/40 text-[#1056f5] font-semibold'
                            : ''
                            }`}
                    >
                        <span className="truncate">{obterResumoMeses()}</span>
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
                                                {selecionado && (
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                )}
                                            </span>
                                            <span className="truncate">{mesObj.rotulo}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <select
                    value={filtros.statusTopo}
                    onChange={(e) => aoAlterarCampo('statusTopo', e.target.value)}
                    className={`${classeControle} w-full sm:w-36 cursor-pointer`}
                >
                    <option value="TODOS">Status: Todos</option>
                    {opcoesStatus.map((st) => (
                        <option key={st} value={st}>
                            Status: {st}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-1.5 ml-auto">
                    <button
                        type="submit"
                        className="h-8 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-2.5 text-[11px] font-semibold transition cursor-pointer"
                    >
                        <Filter className="w-3 h-3" />
                        <span>Filtrar ({totalFiltrados})</span>
                    </button>

                    <button
                        type="button"
                        onClick={aoLimpar}
                        title="Limpar filtros do topo e de todas as colunas"
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

                    <div ref={menuOpcoesRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuExportacaoAberto((v) => !v)}
                            title="Exportar CSV, XLSX ou PDF"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuExportacaoAberto && (
                            <div className="absolute right-0 top-9 z-40 w-44 rounded-xl bg-white shadow-lg border border-slate-200 py-1">
                                <div className="px-3 py-1 border-b border-slate-100">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                                        Exportar Compartilhar
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarPdf()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5 text-[#1056f5] shrink-0" />
                                    <span>Exportar PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarCsv()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Exportar CSV (.csv)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarXlsx()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Exportar XLSX (.xlsx)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    )
}
