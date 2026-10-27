import React, { useMemo } from 'react'
import { useNotificacoes } from '@/contexts/NotificacoesContext'
import { FiltroAlertas } from './components/FiltroAlertas'
import { TabelaAlertas } from './components/TabelaAlertas'
import type { IAlertaNotificacao } from '@/types/notificacao.types'

export const AlertasPage: React.FC = () => {
    const {
        listaAlertas,
        filtrosAplicados,
        rascunhoFiltros,
        atualizarCampoRascunhoFiltro,
        aplicarFiltrosAlertas,
        limparFiltrosAlertas,
        marcarAlertaComoLido,
        alternarConclusaoAlerta,
    } = useNotificacoes()

    const opcoesAnos = useMemo<string[]>(() => {
        const anoAtual = String(new Date().getFullYear())
        const conjunto = new Set<string>([
            anoAtual,
            ...listaAlertas.map((item) => item.ano_referencia),
        ])
        return Array.from(conjunto).sort((a, b) => b.localeCompare(a))
    }, [listaAlertas])

    const opcoesUfs = useMemo<string[]>(() => {
        const conjunto = new Set<string>(listaAlertas.map((item) => item.uf))
        return Array.from(conjunto).sort()
    }, [listaAlertas])

    const opcoesArtistas = useMemo<string[]>(() => {
        const conjunto = new Set<string>(listaAlertas.map((item) => item.artista))
        return Array.from(conjunto).sort()
    }, [listaAlertas])

    const opcoesCategorias = useMemo<string[]>(() => {
        const conjunto = new Set<string>(listaAlertas.map((item) => item.categoria))
        return Array.from(conjunto).sort()
    }, [listaAlertas])

    const quantidadeFiltrosColunaAtivos = useMemo<number>(() => {
        let contador = 0
        if (filtrosAplicados.diasSelecionados.length > 0) contador++
        if (filtrosAplicados.ufsSelecionadas.length > 0) contador++
        if (filtrosAplicados.artistasSelecionados.length > 0) contador++
        if (filtrosAplicados.categoriasSelecionadas.length > 0) contador++
        return contador
    }, [filtrosAplicados])

    const alertasFiltrados = useMemo<IAlertaNotificacao[]>(() => {
        const termoGeral = filtrosAplicados.pesquisaGeral.trim().toLowerCase()

        return listaAlertas.filter((alerta) => {
            if (
                filtrosAplicados.ano !== 'TODOS' &&
                filtrosAplicados.ano.trim() !== '' &&
                alerta.ano_referencia !== filtrosAplicados.ano
            ) {
                return false
            }

            if (filtrosAplicados.meses.length > 0) {
                const mesAlerta = alerta.mes_referencia.padStart(2, '0')
                if (!filtrosAplicados.meses.includes(mesAlerta)) {
                    return false
                }
            }

            if (
                filtrosAplicados.statusConclusao === 'NAO_CONCLUIDO' &&
                alerta.concluida
            ) {
                return false
            }
            if (
                filtrosAplicados.statusConclusao === 'CONCLUIDO' &&
                !alerta.concluida
            ) {
                return false
            }

            if (termoGeral) {
                const textoConsolidadoCelulas = [
                    alerta.dia_vencimento,
                    alerta.data_show,
                    alerta.cidade_uf,
                    alerta.artista,
                    alerta.categoria,
                    alerta.descricao,
                    alerta.grupo_mes_ano,
                ]
                    .join(' ')
                    .toLowerCase()

                if (!textoConsolidadoCelulas.includes(termoGeral)) {
                    return false
                }
            }

            if (filtrosAplicados.diasSelecionados.length > 0) {
                const diaPadronizado = alerta.dia_vencimento.padStart(2, '0')
                if (!filtrosAplicados.diasSelecionados.includes(diaPadronizado)) {
                    return false
                }
            }

            if (
                filtrosAplicados.ufsSelecionadas.length > 0 &&
                !filtrosAplicados.ufsSelecionadas.includes(alerta.uf)
            ) {
                return false
            }

            if (
                filtrosAplicados.artistasSelecionados.length > 0 &&
                !filtrosAplicados.artistasSelecionados.includes(alerta.artista)
            ) {
                return false
            }

            if (
                filtrosAplicados.categoriasSelecionadas.length > 0 &&
                !filtrosAplicados.categoriasSelecionadas.includes(alerta.categoria)
            ) {
                return false
            }

            return true
        })
    }, [listaAlertas, filtrosAplicados])

    const exportarParaPlanilhaCsv = () => {
        const cabecalhos = [
            'Ano',
            'Mês',
            'Dia Vencimento',
            'Data do Show',
            'Cidade - UF',
            'Artista',
            'Categoria',
            'Descrição',
            'Status',
        ]

        const alertasOrdenadosExportacao = [...alertasFiltrados].sort((a, b) => {
            if (a.ano_referencia !== b.ano_referencia) {
                return b.ano_referencia.localeCompare(a.ano_referencia)
            }
            if (a.mes_referencia !== b.mes_referencia) {
                return Number(a.mes_referencia) - Number(b.mes_referencia)
            }
            return b.data_vencimento_iso.localeCompare(a.data_vencimento_iso)
        })

        const linhasCsv = alertasOrdenadosExportacao.map((item) => [
            `"${item.ano_referencia}"`,
            `"${item.grupo_mes_ano.replace(/"/g, '""')}"`,
            `"${item.dia_vencimento}"`,
            `"${item.data_show}"`,
            `"${item.cidade_uf.replace(/"/g, '""')}"`,
            `"${item.artista.replace(/"/g, '""')}"`,
            `"${item.categoria.replace(/"/g, '""')}"`,
            `"${item.descricao.replace(/"/g, '""')}"`,
            `"${item.concluida ? 'CONCLUÍDO' : 'NÃO CONCLUÍDO'}"`,
        ])

        const conteudoCsv = [
            cabecalhos.join(';'),
            ...linhasCsv.map((linha) => linha.join(';')),
        ].join('\r\n')

        const blob = new Blob(['\uFEFF' + conteudoCsv], {
            type: 'text/csv;charset=utf-8;',
        })
        const urlDownload = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = urlDownload
        link.setAttribute('download', 'alertas_pagamento_sarsplanner.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(urlDownload)
    }

    const exportarParaPdf = () => {
        window.print()
    }

    return (
        <div id="area-impressao-alertas" className="space-y-2.5">
            <header className="hidden print:block pb-2 border-b border-slate-200">
                <h1 className="text-base font-bold text-slate-900">
                    Alertas de Pagamento — SarsPlanner
                </h1>
                <p className="text-[11px] text-slate-500">
                    Relatório hierárquico por Mês/Ano ({alertasFiltrados.length} registros)
                </p>
            </header>

            <FiltroAlertas
                filtros={rascunhoFiltros}
                opcoesAnos={opcoesAnos}
                totalFiltrados={alertasFiltrados.length}
                quantidadeFiltrosColunaAtivos={quantidadeFiltrosColunaAtivos}
                aoAlterarCampo={atualizarCampoRascunhoFiltro}
                aoFiltrar={aplicarFiltrosAlertas}
                aoLimpar={limparFiltrosAlertas}
                aoExportarCsv={exportarParaPlanilhaCsv}
                aoExportarPdf={exportarParaPdf}
            />

            <TabelaAlertas
                alertasFiltrados={alertasFiltrados}
                filtros={filtrosAplicados}
                opcoesUfs={opcoesUfs}
                opcoesArtistas={opcoesArtistas}
                opcoesCategorias={opcoesCategorias}
                aoAlterarCampoFiltro={atualizarCampoRascunhoFiltro}
                aoAlternarConclusao={alternarConclusaoAlerta}
                aoMarcarComoLido={marcarAlertaComoLido}
            />
        </div>
    )
}
