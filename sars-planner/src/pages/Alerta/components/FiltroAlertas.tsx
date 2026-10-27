import React, { useState, useRef, useEffect } from 'react'
import {
    Filter,
    FilterX,
    MoreVertical,
    FileSpreadsheet,
    Printer,
    Search,
} from 'lucide-react'
import type {
    IFiltrosAlertas,
    TStatusFiltroConclusao,
} from '@/types/notificacao.types'

export const OPCOES_MESES_SELECT = [
    { valor: '01', rotulo: '01 - Janeiro' },
    { valor: '02', rotulo: '02 - Fevereiro' },
    { valor: '03', rotulo: '03 - Março' },
    { valor: '04', rotulo: '04 - Abril' },
    { valor: '05', rotulo: '05 - Maio' },
    { valor: '06', rotulo: '06 - Junho' },
    { valor: '07', rotulo: '07 - Julho' },
    { valor: '08', rotulo: '08 - Agosto' },
    { valor: '09', rotulo: '09 - Setembro' },
    { valor: '10', rotulo: '10 - Outubro' },
    { valor: '11', rotulo: '11 - Novembro' },
    { valor: '12', rotulo: '12 - Dezembro' },
]

interface IFiltroAlertasProps {
    filtros: IFiltrosAlertas
    opcoesArtistas: string[]
    opcoesAnos: string[]
    totalFiltrados: number
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
    opcoesArtistas,
    opcoesAnos,
    totalFiltrados,
    aoAlterarCampo,
    aoFiltrar,
    aoLimpar,
    aoExportarCsv,
    aoExportarPdf,
}) => {
    const [menuExportacaoAberto, setMenuExportacaoAberto] = useState<boolean>(false)
    const menuOpcoesRef = useRef<HTMLDivElement>(null)
    const anoAtualSistema = String(new Date().getFullYear())

    useEffect(() => {
        const manipularCliqueFora = (evento: MouseEvent) => {
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

    const classesInputPadrao =
        'w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none transition-colors'

    return (
        <form
            onSubmit={manipularSubmit}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-2.5 print:hidden"
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-2">
                    <select
                        value={filtros.ano}
                        onChange={(e) => aoAlterarCampo('ano', e.target.value)}
                        aria-label="Selecionar Ano"
                        className={classesInputPadrao}
                    >
                        <option value="TODOS">Ano: Todos</option>
                        {opcoesAnos.map((anoItem) => (
                            <option key={anoItem} value={anoItem}>
                                Ano: {anoItem} {anoItem === anoAtualSistema ? '(Atual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={filtros.mes}
                        onChange={(e) => aoAlterarCampo('mes', e.target.value)}
                        aria-label="Selecionar Mês"
                        className={classesInputPadrao}
                    >
                        <option value="TODOS">Mês: Todos (Jan–Dez)</option>
                        {OPCOES_MESES_SELECT.map((mesObj) => (
                            <option key={mesObj.valor} value={mesObj.valor}>
                                {mesObj.rotulo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={filtros.artista}
                        onChange={(e) => aoAlterarCampo('artista', e.target.value)}
                        aria-label="Selecionar Artista"
                        className={classesInputPadrao}
                    >
                        <option value="TODOS">Artista: Todos</option>
                        {opcoesArtistas.map((sigla) => (
                            <option key={sigla} value={sigla}>
                                Artista: {sigla}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={filtros.statusConclusao}
                        onChange={(e) =>
                            aoAlterarCampo(
                                'statusConclusao',
                                e.target.value as TStatusFiltroConclusao
                            )
                        }
                        aria-label="Status do Alerta"
                        className={classesInputPadrao}
                    >
                        <option value="NAO_CONCLUIDO">Status: Não Concluído</option>
                        <option value="CONCLUIDO">Status: Concluído</option>
                        <option value="TODOS">Status: Todos</option>
                    </select>
                </div>

                <div className="lg:col-span-3">
                    <input
                        type="text"
                        placeholder="Filtrar por cidade..."
                        value={filtros.cidade}
                        onChange={(e) => aoAlterarCampo('cidade', e.target.value)}
                        className={classesInputPadrao}
                    />
                </div>

                <div className="lg:col-span-1">
                    <input
                        type="text"
                        placeholder="UF"
                        maxLength={2}
                        value={filtros.uf}
                        onChange={(e) => aoAlterarCampo('uf', e.target.value.toUpperCase())}
                        className={classesInputPadrao}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                    <div className="w-full sm:w-44">
                        <input
                            type="text"
                            placeholder="Categoria (Ex: PAGAMENTO)"
                            value={filtros.categoria}
                            onChange={(e) => aoAlterarCampo('categoria', e.target.value)}
                            className={classesInputPadrao}
                        />
                    </div>

                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar por descrição, parcela, valor ou data..."
                            value={filtros.descricao}
                            onChange={(e) => aoAlterarCampo('descricao', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <span className="hidden xl:inline-block text-[11px] text-slate-500 mr-1">
                        Registros: <strong className="text-slate-800">{totalFiltrados}</strong>
                    </span>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filtrar</span>
                    </button>

                    <button
                        type="button"
                        onClick={aoLimpar}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                    >
                        <FilterX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Limpar</span>
                    </button>

                    <div ref={menuOpcoesRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuExportacaoAberto((aberto) => !aberto)}
                            title="Mais opções e exportação"
                            aria-label="Mais opções e exportação"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuExportacaoAberto && (
                            <div className="absolute right-0 top-10 z-40 w-44 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5">
                                <div className="px-3 py-1 border-b border-slate-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Exportar Dados
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarCsv()
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Exportar CSV</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuExportacaoAberto(false)
                                        aoExportarPdf()
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Printer className="w-4 h-4 text-slate-600 shrink-0" />
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
