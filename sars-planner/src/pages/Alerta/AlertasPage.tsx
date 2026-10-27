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

    const opcoesArtistas = useMemo<string[]>(() => {
        const conjunto = new Set<string>(listaAlertas.map((item) => item.artista))
        return Array.from(conjunto).sort()
    }, [listaAlertas])

    const opcoesAnos = useMemo<string[]>(() => {
        const anoAtual = String(new Date().getFullYear())
        const conjunto = new Set<string>([
            anoAtual,
            ...listaAlertas.map((item) => item.ano_referencia),
        ])
        return Array.from(conjunto).sort((a, b) => b.localeCompare(a))
    }, [listaAlertas])

    const alertasFiltrados = useMemo<IAlertaNotificacao[]>(() => {
        return listaAlertas.filter((alerta) => {
            if (
                filtrosAplicados.artista !== 'TODOS' &&
                alerta.artista !== filtrosAplicados.artista
            ) {
                return false
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

            if (
                filtrosAplicados.ano !== 'TODOS' &&
                filtrosAplicados.ano.trim() !== '' &&
                alerta.ano_referencia !== filtrosAplicados.ano
            ) {
                return false
            }

            if (
                filtrosAplicados.mes !== 'TODOS' &&
                filtrosAplicados.mes.trim() !== '' &&
                alerta.mes_referencia.padStart(2, '0') !== filtrosAplicados.mes
            ) {
                return false
            }

            if (
                filtrosAplicados.cidade.trim() &&
                !alerta.cidade
                    .toLowerCase()
                    .includes(filtrosAplicados.cidade.trim().toLowerCase())
            ) {
                return false
            }

            if (
                filtrosAplicados.uf.trim() &&
                alerta.uf.toLowerCase() !== filtrosAplicados.uf.trim().toLowerCase()
            ) {
                return false
            }

            if (
                filtrosAplicados.categoria.trim() &&
                !alerta.categoria
                    .toLowerCase()
                    .includes(filtrosAplicados.categoria.trim().toLowerCase())
            ) {
                return false
            }

            if (
                filtrosAplicados.descricao.trim() &&
                !alerta.descricao
                    .toLowerCase()
                    .includes(filtrosAplicados.descricao.trim().toLowerCase())
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
        <div id="area-impressao-alertas" className="space-y-3.5">
            <header className="hidden print:block pb-2 border-b border-slate-200">
                <h1 className="text-lg font-bold text-slate-900">
                    Alertas de Pagamento — SarsPlanner
                </h1>
                <p className="text-xs text-slate-500">
                    Relatório hierárquico por Mês/Ano ({alertasFiltrados.length} registros)
                </p>
            </header>

            <FiltroAlertas
                filtros={rascunhoFiltros}
                opcoesArtistas={opcoesArtistas}
                opcoesAnos={opcoesAnos}
                totalFiltrados={alertasFiltrados.length}
                aoAlterarCampo={atualizarCampoRascunhoFiltro}
                aoFiltrar={aplicarFiltrosAlertas}
                aoLimpar={limparFiltrosAlertas}
                aoExportarCsv={exportarParaPlanilhaCsv}
                aoExportarPdf={exportarParaPdf}
            />

            <TabelaAlertas
                alertasFiltrados={alertasFiltrados}
                aoAlternarConclusao={alternarConclusaoAlerta}
                aoMarcarComoLido={marcarAlertaComoLido}
            />
        </div>
    )
}
