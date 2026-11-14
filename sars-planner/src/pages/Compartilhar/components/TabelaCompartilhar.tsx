import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Filter,
    Check,
    Search,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import {
    ESTILOS_PADRAO_GRID,
    obterClasseBotaoColunaAzul,
} from '@/components/ui/PadraoGrid'
import { formatarMoedaBRL } from '@/types/financeiro.types'
import {
    ROTULOS_CATEGORIAS_COMPARTILHAR,
    type IDefinicaoCampoCompartilhar,
    type IFiltroColunaDinamica,
    type IFiltrosCompartilhar,
    type IGrupoHierarquicoMesCompartilhar,
    type IRegistroUnificadoCompartilhar,
    type TIdCampoCompartilhar,
    type TLinhaVirtualCompartilhar,
} from '@/types/compartilhar.types'

const NOMES_MESES_POR_NUMERO: Record<number, string> = {
    1: 'Janeiro',
    2: 'Fevereiro',
    3: 'Março',
    4: 'Abril',
    5: 'Maio',
    6: 'Junho',
    7: 'Julho',
    8: 'Agosto',
    9: 'Setembro',
    10: 'Outubro',
    11: 'Novembro',
    12: 'Dezembro',
}

interface ITabelaCompartilharProps {
    registrosFiltrados: IRegistroUnificadoCompartilhar[]
    todosRegistrosBase: IRegistroUnificadoCompartilhar[]
    definicoesColunasAtivas: IDefinicaoCampoCompartilhar[]
    somasPorColuna: Partial<Record<TIdCampoCompartilhar, number>>
    filtros: IFiltrosCompartilhar
    aoAtualizarFiltroColuna: (
        idCampo: TIdCampoCompartilhar,
        novoFiltro: IFiltroColunaDinamica
    ) => void
    aoAlternarOrdenacaoColuna: (idCampo: TIdCampoCompartilhar) => void
}

export const TabelaCompartilhar: React.FC<ITabelaCompartilharProps> = ({
    registrosFiltrados,
    todosRegistrosBase,
    definicoesColunasAtivas,
    somasPorColuna,
    filtros,
    aoAtualizarFiltroColuna,
    aoAlternarOrdenacaoColuna,
}) => {
    const [dropdownColunaAberta, setDropdownColunaAberta] =
        useState<TIdCampoCompartilhar | null>(null)
    const cabecalhoRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const manipularCliqueFora = (e: MouseEvent) => {
            if (
                cabecalhoRef.current &&
                !cabecalhoRef.current.contains(e.target as Node)
            ) {
                setDropdownColunaAberta(null)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const estiloGridTemplateDinamico = useMemo(() => {
        if (definicoesColunasAtivas.length === 0) return '1fr'
        return definicoesColunasAtivas
            .map((col) => `minmax(${col.larguraMinimaPx}px, 1fr)`)
            .join(' ')
    }, [definicoesColunasAtivas])

    const larguraMinimaTotalPx = useMemo(() => {
        return definicoesColunasAtivas.reduce(
            (acc, col) => acc + col.larguraMinimaPx,
            0
        )
    }, [definicoesColunasAtivas])

    const faixasSuperCabecalho = useMemo(() => {
        const faixas: { categoria: string; quantidadeColunas: number }[] = []
        for (const col of definicoesColunasAtivas) {
            const rotuloCat = ROTULOS_CATEGORIAS_COMPARTILHAR[col.categoria]
            const ultima = faixas[faixas.length - 1]
            if (ultima && ultima.categoria === rotuloCat) {
                ultima.quantidadeColunas += 1
            } else {
                faixas.push({ categoria: rotuloCat, quantidadeColunas: 1 })
            }
        }
        return faixas
    }, [definicoesColunasAtivas])

    const obterTituloColunaComSomatoria = (
        col: IDefinicaoCampoCompartilhar
    ): string => {
        if (col.tipoValor === 'moeda') {
            const soma = somasPorColuna[col.id] ?? 0
            return `${col.rotulo} - ${formatarMoedaBRL(soma)}`
        }
        if (col.tipoValor === 'numero') {
            const soma = somasPorColuna[col.id] ?? 0
            return `${col.rotulo} - ${soma}`
        }
        return col.rotulo
    }

    const gruposHierarquicos = useMemo<IGrupoHierarquicoMesCompartilhar[]>(() => {
        const mapa = new Map<string, IRegistroUnificadoCompartilhar[]>()
        for (const reg of registrosFiltrados) {
            const mesPad = reg.mes_referencia.padStart(2, '0')
            const chave = `${reg.ano_referencia}-${mesPad}`
            const lista = mapa.get(chave) || []
            lista.push(reg)
            mapa.set(chave, lista)
        }

        const grupos: IGrupoHierarquicoMesCompartilhar[] = Array.from(
            mapa.entries()
        ).map(([chaveGrupo, itens]) => {
            const [ano, mesStr] = chaveGrupo.split('-')
            const mesNumero = Number(mesStr)
            const nomeMesExtenso =
                NOMES_MESES_POR_NUMERO[mesNumero] || `Mês ${mesStr}`

            const itensOrdenados = [...itens].sort((a, b) => {
                const colOrd = filtros.colunaOrdenacao
                const mult = filtros.direcaoOrdenacao === 'asc' ? 1 : -1

                if (!colOrd) {
                    return a.data_evento_iso.localeCompare(b.data_evento_iso) * mult
                }

                const defCol = definicoesColunasAtivas.find((c) => c.id === colOrd)
                if (
                    defCol &&
                    (defCol.tipoValor === 'moeda' || defCol.tipoValor === 'numero')
                ) {
                    const valA = a.valoresNumericos[colOrd] ?? 0
                    const valB = b.valoresNumericos[colOrd] ?? 0
                    return (valA - valB) * mult
                }

                const txtA = a.valoresTexto[colOrd] || ''
                const txtB = b.valoresTexto[colOrd] || ''
                return txtA.localeCompare(txtB, 'pt-BR') * mult
            })

            return {
                chaveGrupo,
                ano,
                mesNumero,
                nomeMesExtenso,
                rotuloMesAno: `${nomeMesExtenso} | ${ano.slice(-2)}`,
                itensOrdenados,
            }
        })

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano.localeCompare(a.ano)
            return a.mesNumero - b.mesNumero
        })
    }, [
        registrosFiltrados,
        filtros.colunaOrdenacao,
        filtros.direcaoOrdenacao,
        definicoesColunasAtivas,
    ])

    const [mesesAbertos, setMesesAbertos] = useState<Record<string, boolean>>({})

    useEffect(() => {
        setMesesAbertos((anterior) => {
            const novo: Record<string, boolean> = {}
            for (const g of gruposHierarquicos) {
                novo[g.chaveGrupo] =
                    anterior[g.chaveGrupo] !== undefined ? anterior[g.chaveGrupo] : true
            }
            return novo
        })
    }, [gruposHierarquicos])

    const linhasVirtuais = useMemo<TLinhaVirtualCompartilhar[]>(() => {
        const plana: TLinhaVirtualCompartilhar[] = []
        for (const grupo of gruposHierarquicos) {
            const aberto = Boolean(mesesAbertos[grupo.chaveGrupo])
            plana.push({
                tipo: 'cabecalho_mes',
                chaveUnica: `mes-${grupo.chaveGrupo}`,
                grupo,
                aberto,
            })
            if (aberto) {
                grupo.itensOrdenados.forEach((reg, idx) => {
                    plana.push({
                        tipo: 'linha_dados',
                        chaveUnica: `comp-${grupo.chaveGrupo}-${reg.evento_id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        registro: reg,
                        ehUltimaLinhaDoMes: idx === grupo.itensOrdenados.length - 1,
                    })
                })
            }
        }
        return plana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback(() => 32, [])
    const ALTURA_VIEWPORT_PX = 500

    const { alturaTotalPx, itensVisiveis, manipularScroll } = useVirtualizacao({
        itens: linhasVirtuais,
        alturaContainerPx: ALTURA_VIEWPORT_PX,
        obterAlturaItemPx,
        overscan: 12,
    })

    if (definicoesColunasAtivas.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Nenhuma coluna selecionada. Clique em um campo de{' '}
                <strong>Evento, Financeiro ou Artistas</strong> no seletor de colunas para
                montar a tabela.
            </div>
        )
    }

    return (
        <>
            <div className={`${ESTILOS_PADRAO_GRID.containerCartao} print:hidden`}>
                <div className="overflow-x-auto flex-1 flex flex-col">
                    <div
                        style={{ minWidth: `${Math.max(840, larguraMinimaTotalPx)}px` }}
                        className="flex-1 flex flex-col"
                    >
                        <div
                            onScroll={manipularScroll}
                            className={ESTILOS_PADRAO_GRID.viewportAlturaFixa}
                        >
                            <div ref={cabecalhoRef} className="sticky top-0 z-30 select-none">
                                <div
                                    style={{ gridTemplateColumns: estiloGridTemplateDinamico }}
                                    className="grid items-center h-6 bg-[#0b43c6] text-white border-b border-blue-400/40 text-[10px] font-extrabold uppercase tracking-widest px-2"
                                >
                                    {faixasSuperCabecalho.map((faixa, idx) => (
                                        <div
                                            key={`${faixa.categoria}-${idx}`}
                                            style={{
                                                gridColumn: `span ${faixa.quantidadeColunas} / span ${faixa.quantidadeColunas}`,
                                            }}
                                            className="text-center border-r last:border-r-0 border-blue-400/40 truncate px-1"
                                        >
                                            {faixa.categoria}
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{ gridTemplateColumns: estiloGridTemplateDinamico }}
                                    className="grid items-center px-2 h-9 bg-[#1056f5] text-white border-b border-blue-700 text-[10.5px] font-bold uppercase tracking-wider shadow-2xs"
                                >
                                    {definicoesColunasAtivas.map((col, idxCol) => {
                                        const filtroAtual: IFiltroColunaDinamica = filtros
                                            .filtrosPorColuna[col.id] || {
                                            textoBusca: '',
                                            valoresSelecionados: [],
                                        }
                                        const possuiFiltro =
                                            filtroAtual.textoBusca.trim() !== '' ||
                                            filtroAtual.valoresSelecionados.length > 0

                                        const opcoesUnicasColuna = Array.from(
                                            new Set(
                                                todosRegistrosBase
                                                    .map((r) => r.valoresTexto[col.id])
                                                    .filter(Boolean)
                                            )
                                        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

                                        const opcoesVisiveisDropdown = opcoesUnicasColuna.filter(
                                            (op) =>
                                                op
                                                    .toLowerCase()
                                                    .includes(filtroAtual.textoBusca.trim().toLowerCase())
                                        )

                                        const alinhamentoFlex =
                                            col.alinhamento === 'right'
                                                ? 'justify-end'
                                                : col.alinhamento === 'center'
                                                    ? 'justify-center'
                                                    : 'justify-start'

                                        const alinharDropdownDireita =
                                            idxCol >= definicoesColunasAtivas.length - 2

                                        return (
                                            <div
                                                key={col.id}
                                                className={`relative px-1.5 flex items-center gap-1 ${alinhamentoFlex}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => aoAlternarOrdenacaoColuna(col.id)}
                                                    title={`Ordenar por ${col.rotulo}`}
                                                    className="hover:underline cursor-pointer truncate max-w-full"
                                                >
                                                    {obterTituloColunaComSomatoria(col)}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDropdownColunaAberta((ant) =>
                                                            ant === col.id ? null : col.id
                                                        )
                                                    }
                                                    title={`Filtrar coluna ${col.rotulo}`}
                                                    className={obterClasseBotaoColunaAzul(possuiFiltro)}
                                                >
                                                    <Filter className="w-2.5 h-2.5 shrink-0" />
                                                    <ChevronDown className="w-2.5 h-2.5 shrink-0" />
                                                </button>

                                                {dropdownColunaAberta === col.id && (
                                                    <div
                                                        className={`absolute ${alinharDropdownDireita ? 'right-0' : 'left-0'
                                                            } top-9 z-50 w-60 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2`}
                                                    >
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                Filtrar {col.rotulo}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        aoAlternarOrdenacaoColuna(col.id)
                                                                    }
                                                                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#1056f5] cursor-pointer"
                                                                >
                                                                    {filtros.colunaOrdenacao === col.id &&
                                                                        filtros.direcaoOrdenacao === 'asc' ? (
                                                                        <ArrowUp className="w-3 h-3" />
                                                                    ) : (
                                                                        <ArrowDown className="w-3 h-3" />
                                                                    )}
                                                                    <span>Ordenar</span>
                                                                </button>

                                                                {possuiFiltro && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            aoAtualizarFiltroColuna(col.id, {
                                                                                textoBusca: '',
                                                                                valoresSelecionados: [],
                                                                            })
                                                                        }
                                                                        className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                                                                    >
                                                                        Limpar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative">
                                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                            <input
                                                                type="text"
                                                                placeholder={`Buscar em ${col.rotulo}...`}
                                                                value={filtroAtual.textoBusca}
                                                                onChange={(e) =>
                                                                    aoAtualizarFiltroColuna(col.id, {
                                                                        ...filtroAtual,
                                                                        textoBusca: e.target.value,
                                                                    })
                                                                }
                                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                                            />
                                                        </div>

                                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                                            {opcoesVisiveisDropdown.length === 0 ? (
                                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                                    Nenhum valor encontrado
                                                                </p>
                                                            ) : (
                                                                opcoesVisiveisDropdown.map((valorOpcao) => {
                                                                    const marcado =
                                                                        filtroAtual.valoresSelecionados.includes(
                                                                            valorOpcao
                                                                        )
                                                                    return (
                                                                        <button
                                                                            key={valorOpcao}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const novaLista = marcado
                                                                                    ? filtroAtual.valoresSelecionados.filter(
                                                                                        (v) => v !== valorOpcao
                                                                                    )
                                                                                    : [
                                                                                        ...filtroAtual.valoresSelecionados,
                                                                                        valorOpcao,
                                                                                    ]
                                                                                aoAtualizarFiltroColuna(col.id, {
                                                                                    ...filtroAtual,
                                                                                    valoresSelecionados: novaLista,
                                                                                })
                                                                            }}
                                                                            className={`w-full flex items-center gap-2 rounded px-2 py-1 text-left text-[10.5px] cursor-pointer ${marcado
                                                                                    ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                                                    : 'text-slate-600 hover:bg-slate-100'
                                                                                }`}
                                                                        >
                                                                            <span
                                                                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${marcado
                                                                                        ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                                                        : 'border-slate-300 bg-white'
                                                                                    }`}
                                                                            >
                                                                                {marcado && (
                                                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                                                )}
                                                                            </span>
                                                                            <span className="truncate">
                                                                                {valorOpcao}
                                                                            </span>
                                                                        </button>
                                                                    )
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {linhasVirtuais.length === 0 ? (
                                <div className="py-12 px-4 text-center text-[11px] text-slate-400">
                                    Nenhum registro encontrado para os filtros aplicados.
                                </div>
                            ) : (
                                <div
                                    style={{ height: `${alturaTotalPx}px` }}
                                    className="relative w-full z-10"
                                >
                                    {itensVisiveis.map(({ item, topoPx, alturaPx }) => {
                                        if (item.tipo === 'cabecalho_mes') {
                                            const { grupo, aberto } = item
                                            return (
                                                <div
                                                    key={item.chaveUnica}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: `${alturaPx}px`,
                                                        transform: `translateY(${topoPx}px)`,
                                                    }}
                                                    onClick={() =>
                                                        setMesesAbertos((ant) => ({
                                                            ...ant,
                                                            [grupo.chaveGrupo]: !ant[grupo.chaveGrupo],
                                                        }))
                                                    }
                                                    className={ESTILOS_PADRAO_GRID.linhaGrupoMesCinzaClaro}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white border border-slate-300 text-slate-600">
                                                            {aberto ? (
                                                                <ChevronDown className="w-3 h-3 text-[#1056f5]" />
                                                            ) : (
                                                                <ChevronRight className="w-3 h-3 text-slate-500" />
                                                            )}
                                                        </span>
                                                        <span className="text-[11px] font-bold tracking-wide text-slate-700 uppercase">
                                                            {grupo.rotuloMesAno}
                                                        </span>
                                                    </div>

                                                    <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.2 text-[9.5px] font-semibold text-slate-600">
                                                        {grupo.itensOrdenados.length}{' '}
                                                        {grupo.itensOrdenados.length === 1
                                                            ? 'evento'
                                                            : 'eventos'}
                                                    </span>
                                                </div>
                                            )
                                        }

                                        const { registro, ehUltimaLinhaDoMes } = item
                                        return (
                                            <div
                                                key={item.chaveUnica}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: `${alturaPx}px`,
                                                    transform: `translateY(${topoPx}px)`,
                                                    gridTemplateColumns: estiloGridTemplateDinamico,
                                                }}
                                                className={`grid ${ESTILOS_PADRAO_GRID.linhaDadosBase} ${ehUltimaLinhaDoMes
                                                        ? 'border-b border-slate-200'
                                                        : 'border-b border-slate-100'
                                                    }`}
                                            >
                                                {definicoesColunasAtivas.map((col) => {
                                                    const textoCelula =
                                                        registro.valoresTexto[col.id] || '—'
                                                    const classeAlinhamento =
                                                        col.alinhamento === 'right'
                                                            ? 'text-right font-semibold text-slate-800'
                                                            : col.alinhamento === 'center'
                                                                ? 'text-center'
                                                                : 'text-left'

                                                    return (
                                                        <div
                                                            key={col.id}
                                                            title={textoCelula}
                                                            className={`px-2 truncate ${classeAlinhamento}`}
                                                        >
                                                            {col.id === 'art_sigla' ? (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                                                    {textoCelula}
                                                                </span>
                                                            ) : (
                                                                textoCelula
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden print:block space-y-3">
                <div className="border-b-2 border-[#1056f5] pb-2">
                    <h1 className="text-base font-extrabold text-slate-900 uppercase">
                        Relatório Compartilhar — SarsPlanner
                    </h1>
                    <p className="text-[10px] text-slate-500">
                        Colunas personalizadas selecionadas pelo usuário (
                        {registrosFiltrados.length} registros)
                    </p>
                </div>

                <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-[#1056f5] text-white text-[9.5px] font-bold uppercase">
                            {definicoesColunasAtivas.map((col) => (
                                <th
                                    key={`print-th-${col.id}`}
                                    className="py-1.5 px-2 border border-blue-600"
                                >
                                    {obterTituloColunaComSomatoria(col)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-[9.5px] text-slate-700">
                        {gruposHierarquicos.map((grupo) => (
                            <React.Fragment key={`print-grp-${grupo.chaveGrupo}`}>
                                <tr className="bg-slate-200 font-extrabold text-slate-800">
                                    <td
                                        colSpan={definicoesColunasAtivas.length}
                                        className="py-1 px-2 uppercase border border-slate-300"
                                    >
                                        {grupo.rotuloMesAno} ({grupo.itensOrdenados.length} eventos)
                                    </td>
                                </tr>
                                {grupo.itensOrdenados.map((reg) => (
                                    <tr
                                        key={`print-row-${reg.evento_id}`}
                                        className="border-b border-slate-200"
                                    >
                                        {definicoesColunasAtivas.map((col) => (
                                            <td
                                                key={`print-td-${reg.evento_id}-${col.id}`}
                                                className="py-1 px-2 border border-slate-200"
                                            >
                                                {reg.valoresTexto[col.id] || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
