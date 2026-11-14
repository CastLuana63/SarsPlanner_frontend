import React, { useState, useMemo, useEffect } from 'react'
import artistasMock from '@/mocks/artistasMock.json'
import { useEventos } from '@/contexts/EventosContext'
import { useFinanceiro } from '@/contexts/FinanceiroContext'
import {
    formatarMoedaBRL,
    converterTextoParaValorMonetario,
} from '@/types/financeiro.types'
import {
    CATALOGO_CAMPOS_COMPARTILHAR,
    CAMPOS_SELECIONADOS_PADRAO,
    type IDefinicaoCampoCompartilhar,
    type IFiltroColunaDinamica,
    type IFiltrosCompartilhar,
    type IRegistroUnificadoCompartilhar,
    type TCategoriaCampoCompartilhar,
    type TIdCampoCompartilhar,
} from '@/types/compartilhar.types'
import type { IArtista } from '@/types/artista.types'
import { FiltroCompartilhar } from './components/FiltroCompartilhar'
import { SeletorCamposPermissao } from './components/SeletorCamposPermissao'
import { TabelaCompartilhar } from './components/TabelaCompartilhar'

const CHAVE_STORAGE_COLUNAS_COMPARTILHAR =
    '@SarsPlanner:colunasCompartilhar:v1'
const CHAVE_STORAGE_FILTROS_COMPARTILHAR =
    '@SarsPlanner:filtrosCompartilhar:v1'

const FILTROS_INICIAIS_COMPARTILHAR: IFiltrosCompartilhar = {
    artistaTopo: 'TODOS',
    ano: String(new Date().getFullYear()),
    meses: [],
    statusTopo: 'TODOS',
    pesquisaGeral: '',
    filtrosPorColuna: {},
    colunaOrdenacao: 'ev_dia',
    direcaoOrdenacao: 'asc',
}

const extrairValorMonetarioDeTextoShow = (textoShow: string): number => {
    if (!textoShow) return 0
    const primeiraParte = textoShow.split('+')[0].trim()
    const matchNumeroK = primeiraParte.match(/(\d+(?:[.,]\d+)?)\s*K/i)
    if (matchNumeroK) {
        return parseFloat(matchNumeroK[1].replace(',', '.')) * 1000
    }
    return converterTextoParaValorMonetario(primeiraParte)
}

export const CompartilharPage: React.FC = () => {
    const { listaEventos, obterStatusPorId } = useEventos()
    const { registrosCalculados } = useFinanceiro()
    const listaArtistas = artistasMock as IArtista[]

    const [seletorColunasAberto, setSeletorColunasAberto] =
        useState<boolean>(true)

    const [camposSelecionados, setCamposSelecionados] = useState<
        TIdCampoCompartilhar[]
    >(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_COLUNAS_COMPARTILHAR)
        if (salvo) {
            try {
                const parseado = JSON.parse(salvo) as TIdCampoCompartilhar[]
                if (Array.isArray(parseado) && parseado.length > 0) return parseado
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_COLUNAS_COMPARTILHAR)
            }
        }
        return CAMPOS_SELECIONADOS_PADRAO
    })

    const [filtros, setFiltros] = useState<IFiltrosCompartilhar>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_FILTROS_COMPARTILHAR)
        if (salvo) {
            try {
                return { ...FILTROS_INICIAIS_COMPARTILHAR, ...JSON.parse(salvo) }
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_FILTROS_COMPARTILHAR)
            }
        }
        return FILTROS_INICIAIS_COMPARTILHAR
    })

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_COLUNAS_COMPARTILHAR,
            JSON.stringify(camposSelecionados)
        )
    }, [camposSelecionados])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FILTROS_COMPARTILHAR,
            JSON.stringify(filtros)
        )
    }, [filtros])

    const definicoesColunasAtivas = useMemo<
        IDefinicaoCampoCompartilhar[]
    >(() => {
        return camposSelecionados
            .map((id) => CATALOGO_CAMPOS_COMPARTILHAR.find((c) => c.id === id))
            .filter((c): c is IDefinicaoCampoCompartilhar => Boolean(c))
    }, [camposSelecionados])

    const registrosUnificados = useMemo<IRegistroUnificadoCompartilhar[]>(() => {
        return listaEventos.map((ev) => {
            const fin = registrosCalculados.find((f) => f.evento_id === ev.id)
            const art = listaArtistas.find(
                (a) => a.nome_social.toUpperCase() === ev.artista.toUpperCase()
            )
            const statusObj = obterStatusPorId(ev.status_id)

            const valorShowNum = extrairValorMonetarioDeTextoShow(ev.valor_show)
            const diariaValorNum = fin?.diaria_valor ?? 0
            const receitaTotalNum = fin?.receitaTotal ?? 0
            const despesaTotalNum = fin?.despesaTotal ?? 0
            const valorLiquidoNum = fin?.valorLiquido ?? 0
            const totalPagoNum = fin?.totalPago ?? 0
            const faltaPagarNum = fin?.totalFaltaPagar ?? 0
            const qtdParcelasNum = fin?.quantidadeParcelasTotal ?? 0
            const qtdEventosArtistaNum = art?.quantidade_eventos ?? 1

            const valoresTexto: Record<TIdCampoCompartilhar, string> = {
                ev_dia: ev.dia_evento,
                ev_data: ev.data_evento.split('-').reverse().join('/'),
                ev_horario: `${ev.horario_inicio} - ${ev.horario_fim}`,
                ev_cidade_uf: ev.cidade_uf,
                ev_uf: ev.uf,
                ev_valor_show:
                    valorShowNum > 0
                        ? `${formatarMoedaBRL(valorShowNum)} (${ev.valor_show})`
                        : ev.valor_show,
                ev_comissao: ev.comissao,
                ev_vendedor: ev.vendedor,
                ev_producao: ev.producao,
                ev_status: statusObj.rotulo,
                ev_realizado: ev.realizado ? 'S' : 'N',

                fin_contato: fin?.contato_nome_telefone || '—',
                fin_diaria_sn: fin?.diaria_ativa ? 'S' : 'N',
                fin_diaria_valor:
                    diariaValorNum > 0 ? formatarMoedaBRL(diariaValorNum) : 'R$ 0,00',
                fin_custos: fin?.producao_custos || 'CONTRATANTE',
                fin_operacional: fin?.producao_operacional || 'CONTRATANTE',
                fin_receita_total: formatarMoedaBRL(receitaTotalNum),
                fin_despesa_total: formatarMoedaBRL(despesaTotalNum),
                fin_valor_liquido: formatarMoedaBRL(valorLiquidoNum),
                fin_total_pago: formatarMoedaBRL(totalPagoNum),
                fin_falta_pagar: formatarMoedaBRL(faltaPagarNum),
                fin_qtd_parcelas: String(qtdParcelasNum),

                art_sigla: ev.artista,
                art_nome_completo: art?.nome_artista || ev.artista,
                art_email: art?.email || '—',
                art_telefone: art?.telefone || '—',
                art_qtd_eventos: String(qtdEventosArtistaNum),
            }

            const valoresNumericos: Partial<Record<TIdCampoCompartilhar, number>> = {
                ev_valor_show: valorShowNum,
                fin_diaria_valor: diariaValorNum,
                fin_receita_total: receitaTotalNum,
                fin_despesa_total: despesaTotalNum,
                fin_valor_liquido: valorLiquidoNum,
                fin_total_pago: totalPagoNum,
                fin_falta_pagar: faltaPagarNum,
                fin_qtd_parcelas: qtdParcelasNum,
                art_qtd_eventos: qtdEventosArtistaNum,
            }

            return {
                evento_id: ev.id,
                mes_referencia: ev.mes_referencia,
                ano_referencia: ev.ano_referencia,
                data_evento_iso: ev.data_evento,
                valoresTexto,
                valoresNumericos,
            }
        })
    }, [listaEventos, registrosCalculados, listaArtistas, obterStatusPorId])

    const opcoesArtistas = useMemo(() => {
        return Array.from(
            new Set(registrosUnificados.map((r) => r.valoresTexto.art_sigla))
        ).sort()
    }, [registrosUnificados])

    const opcoesAnos = useMemo(() => {
        const anoAtual = String(new Date().getFullYear())
        const conj = new Set([
            anoAtual,
            ...registrosUnificados.map((r) => r.ano_referencia),
        ])
        return Array.from(conj).sort((a, b) => b.localeCompare(a))
    }, [registrosUnificados])

    const opcoesStatus = useMemo(() => {
        return Array.from(
            new Set(registrosUnificados.map((r) => r.valoresTexto.ev_status))
        ).sort()
    }, [registrosUnificados])

    const quantidadeFiltrosColunaAtivos = useMemo(() => {
        let cont = 0
        for (const col of definicoesColunasAtivas) {
            const fc = filtros.filtrosPorColuna[col.id]
            if (
                fc &&
                (fc.textoBusca.trim() !== '' || fc.valoresSelecionados.length > 0)
            ) {
                cont++
            }
        }
        return cont
    }, [definicoesColunasAtivas, filtros.filtrosPorColuna])

    const registrosFiltrados = useMemo<IRegistroUnificadoCompartilhar[]>(() => {
        const buscaGeral = filtros.pesquisaGeral.trim().toLowerCase()

        return registrosUnificados.filter((reg) => {
            if (
                filtros.artistaTopo !== 'TODOS' &&
                reg.valoresTexto.art_sigla !== filtros.artistaTopo
            ) {
                return false
            }

            if (filtros.ano !== 'TODOS' && reg.ano_referencia !== filtros.ano) {
                return false
            }

            if (
                filtros.meses.length > 0 &&
                !filtros.meses.includes(reg.mes_referencia.padStart(2, '0'))
            ) {
                return false
            }

            if (
                filtros.statusTopo !== 'TODOS' &&
                reg.valoresTexto.ev_status !== filtros.statusTopo
            ) {
                return false
            }

            if (buscaGeral) {
                const textoVisivel = definicoesColunasAtivas
                    .map((col) => reg.valoresTexto[col.id] || '')
                    .join(' ')
                    .toLowerCase()

                if (!textoVisivel.includes(buscaGeral)) return false
            }

            for (const col of definicoesColunasAtivas) {
                const fc = filtros.filtrosPorColuna[col.id]
                if (!fc) continue

                const valorCelula = reg.valoresTexto[col.id] || ''
                const temSelecionados = fc.valoresSelecionados.length > 0
                const temTexto = fc.textoBusca.trim() !== ''

                if (temSelecionados || temTexto) {
                    const bateSelecionados =
                        temSelecionados && fc.valoresSelecionados.includes(valorCelula)
                    const bateTexto =
                        !temSelecionados &&
                        temTexto &&
                        valorCelula
                            .toLowerCase()
                            .includes(fc.textoBusca.trim().toLowerCase())

                    if (!bateSelecionados && !bateTexto) return false
                }
            }

            return true
        })
    }, [registrosUnificados, filtros, definicoesColunasAtivas])

    const somasPorColuna = useMemo<
        Partial<Record<TIdCampoCompartilhar, number>>
    >(() => {
        const somas: Partial<Record<TIdCampoCompartilhar, number>> = {}
        for (const col of definicoesColunasAtivas) {
            if (col.tipoValor === 'moeda' || col.tipoValor === 'numero') {
                somas[col.id] = registrosFiltrados.reduce(
                    (acc, reg) => acc + (reg.valoresNumericos[col.id] ?? 0),
                    0
                )
            }
        }
        return somas
    }, [definicoesColunasAtivas, registrosFiltrados])

    const alternarSelecaoCampo = (idCampo: TIdCampoCompartilhar) => {
        setCamposSelecionados((ant) => {
            if (ant.includes(idCampo)) {
                return ant.filter((id) => id !== idCampo)
            }
            return [...ant, idCampo]
        })
    }

    const selecionarCategoriaInteira = (cat: TCategoriaCampoCompartilhar) => {
        const idsDaCategoria = CATALOGO_CAMPOS_COMPARTILHAR.filter(
            (c) => c.categoria === cat
        ).map((c) => c.id)

        setCamposSelecionados((ant) => {
            const conjunto = new Set([...ant, ...idsDaCategoria])
            return Array.from(conjunto)
        })
    }

    const removerCategoriaInteira = (cat: TCategoriaCampoCompartilhar) => {
        const idsDaCategoria = new Set(
            CATALOGO_CAMPOS_COMPARTILHAR.filter((c) => c.categoria === cat).map(
                (c) => c.id
            )
        )
        setCamposSelecionados((ant) =>
            ant.filter((id) => !idsDaCategoria.has(id))
        )
    }

    const atualizarCampoFiltroTopo = <K extends keyof IFiltrosCompartilhar>(
        campo: K,
        valor: IFiltrosCompartilhar[K]
    ) => {
        setFiltros((ant) => ({ ...ant, [campo]: valor }))
    }

    const atualizarFiltroDeColuna = (
        idCampo: TIdCampoCompartilhar,
        novoFiltro: IFiltroColunaDinamica
    ) => {
        setFiltros((ant) => ({
            ...ant,
            filtrosPorColuna: {
                ...ant.filtrosPorColuna,
                [idCampo]: novoFiltro,
            },
        }))
    }

    const alternarOrdenacaoColuna = (idCampo: TIdCampoCompartilhar) => {
        setFiltros((ant) => ({
            ...ant,
            colunaOrdenacao: idCampo,
            direcaoOrdenacao:
                ant.colunaOrdenacao === idCampo && ant.direcaoOrdenacao === 'asc'
                    ? 'desc'
                    : 'asc',
        }))
    }

    const limparTodosOsFiltros = () => {
        setFiltros(FILTROS_INICIAIS_COMPARTILHAR)
        localStorage.removeItem(CHAVE_STORAGE_FILTROS_COMPARTILHAR)
    }

    const exportarParaCsv = () => {
        const cabecalhos = definicoesColunasAtivas.map((col) => {
            if (col.tipoValor === 'moeda') {
                return `"${col.rotulo} - ${formatarMoedaBRL(somasPorColuna[col.id] ?? 0)}"`
            }
            if (col.tipoValor === 'numero') {
                return `"${col.rotulo} - ${somasPorColuna[col.id] ?? 0}"`
            }
            return `"${col.rotulo}"`
        })

        const linhas = registrosFiltrados.map((reg) =>
            definicoesColunasAtivas
                .map(
                    (col) =>
                        `"${(reg.valoresTexto[col.id] || '').replace(/"/g, '""')}"`
                )
                .join(';')
        )

        const conteudoCsv = [cabecalhos.join(';'), ...linhas].join('\r\n')
        const blob = new Blob(['\uFEFF' + conteudoCsv], {
            type: 'text/csv;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'compartilhar_sarsplanner.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
    
    const exportarParaXlsx = () => {
        const escaparXml = (str: string) =>
            str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')

        const celulasCabecalhoXml = definicoesColunasAtivas
            .map((col) => {
                const titulo =
                    col.tipoValor === 'moeda'
                        ? `${col.rotulo} - ${formatarMoedaBRL(somasPorColuna[col.id] ?? 0)}`
                        : col.tipoValor === 'numero'
                            ? `${col.rotulo} - ${somasPorColuna[col.id] ?? 0}`
                            : col.rotulo
                return `<Cell><Data ss:Type="String">${escaparXml(titulo)}</Data></Cell>`
            })
            .join('')

        const linhasXml = registrosFiltrados
            .map((reg) => {
                const celulas = definicoesColunasAtivas
                    .map(
                        (col) =>
                            `<Cell><Data ss:Type="String">${escaparXml(
                                reg.valoresTexto[col.id] || ''
                            )}</Data></Cell>`
                    )
                    .join('')
                return `<Row>${celulas}</Row>`
            })
            .join('')

        const xmlPlanilha = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Compartilhar">
  <Table>
   <Row>${celulasCabecalhoXml}</Row>
   ${linhasXml}
  </Table>
 </Worksheet>
</Workbook>`

        const blob = new Blob([xmlPlanilha], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'compartilhar_sarsplanner.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-2.5">
            <FiltroCompartilhar
                filtros={filtros}
                opcoesArtistas={opcoesArtistas}
                opcoesAnos={opcoesAnos}
                opcoesStatus={opcoesStatus}
                totalFiltrados={registrosFiltrados.length}
                totalColunasSelecionadas={definicoesColunasAtivas.length}
                quantidadeFiltrosColunaAtivos={quantidadeFiltrosColunaAtivos}
                seletorColunasAberto={seletorColunasAberto}
                aoAlternarSeletorColunas={() => setSeletorColunasAberto((v) => !v)}
                aoAlterarCampo={atualizarCampoFiltroTopo}
                aoFiltrar={() => { }}
                aoLimpar={limparTodosOsFiltros}
                aoExportarCsv={exportarParaCsv}
                aoExportarXlsx={exportarParaXlsx}
                aoExportarPdf={() => window.print()}
            />

            {seletorColunasAberto && (
                <SeletorCamposPermissao
                    camposSelecionados={camposSelecionados}
                    aoAlternarCampo={alternarSelecaoCampo}
                    aoSelecionarCategoriaInteira={selecionarCategoriaInteira}
                    aoRemoverCategoriaInteira={removerCategoriaInteira}
                    aoRestaurarPadrao={() =>
                        setCamposSelecionados(CAMPOS_SELECIONADOS_PADRAO)
                    }
                />
            )}

            <TabelaCompartilhar
                registrosFiltrados={registrosFiltrados}
                todosRegistrosBase={registrosUnificados}
                definicoesColunasAtivas={definicoesColunasAtivas}
                somasPorColuna={somasPorColuna}
                filtros={filtros}
                aoAtualizarFiltroColuna={atualizarFiltroDeColuna}
                aoAlternarOrdenacaoColuna={alternarOrdenacaoColuna}
            />
        </div>
    )
}
