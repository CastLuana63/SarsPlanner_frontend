import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinanceiro } from '@/contexts/FinanceiroContext'
import { FiltroFinanceiro } from './components/FiltroFinanceiro'
import { TabelaFinanceiro } from './components/TabelaFinanceiro'
import { ModalDespesasEvento } from './components/ModalDespesasEvento'
import {
    formatarMoedaBRL,
    converterTextoParaValorMonetario,
    type IResumoCalculadoFinanceiroEvento,
} from '@/types/financeiro.types'

export const FinanceiroPage: React.FC = () => {
    const navigate = useNavigate()
    const {
        registrosCalculados,
        filtrosAplicados,
        rascunhoFiltros,
        atualizarCampoFiltro,
        aplicarFiltros,
        limparFiltros,
        adicionarDespesa,
        excluirDespesa,
    } = useFinanceiro()

    const [eventoModalDespesaId, setEventoModalDespesaId] = useState<
        number | null
    >(null)

    const registroModalDespesaAtual = useMemo(
        () =>
            registrosCalculados.find((r) => r.evento_id === eventoModalDespesaId) ||
            null,
        [registrosCalculados, eventoModalDespesaId]
    )

    const opcoesAnos = useMemo(() => {
        const anoAtual = String(new Date().getFullYear())
        const conj = new Set([
            anoAtual,
            ...registrosCalculados.map((r) => r.ano_referencia),
        ])
        return Array.from(conj).sort((a, b) => b.localeCompare(a))
    }, [registrosCalculados])

    const opcoesArtistas = useMemo(() => {
        return Array.from(
            new Set(registrosCalculados.map((r) => r.artista))
        ).sort()
    }, [registrosCalculados])

    const opcoesUfs = useMemo(() => {
        return Array.from(new Set(registrosCalculados.map((r) => r.uf))).sort()
    }, [registrosCalculados])

    const quantidadeFiltrosColunaAtivos = useMemo(() => {
        let c = 0
        if (filtrosAplicados.diasSelecionados.length > 0) c++
        if (filtrosAplicados.ufsSelecionadas.length > 0) c++
        if (filtrosAplicados.artistasSelecionados.length > 0) c++
        if (filtrosAplicados.textoReceitaMinima.trim()) c++
        if (filtrosAplicados.textoDespesaMinima.trim()) c++
        if (filtrosAplicados.textoLiquidoMinimo.trim()) c++
        return c
    }, [filtrosAplicados])

    const registrosFiltrados = useMemo<IResumoCalculadoFinanceiroEvento[]>(() => {
        const busca = filtrosAplicados.pesquisaGeral.trim().toLowerCase()
        const minReceita = converterTextoParaValorMonetario(
            filtrosAplicados.textoReceitaMinima
        )
        const minDespesa = converterTextoParaValorMonetario(
            filtrosAplicados.textoDespesaMinima
        )
        const minLiquido = converterTextoParaValorMonetario(
            filtrosAplicados.textoLiquidoMinimo
        )

        return registrosCalculados.filter((reg) => {
            if (
                filtrosAplicados.ano !== 'TODOS' &&
                reg.ano_referencia !== filtrosAplicados.ano
            ) {
                return false
            }

            if (
                filtrosAplicados.meses.length > 0 &&
                !filtrosAplicados.meses.includes(reg.mes_referencia.padStart(2, '0'))
            ) {
                return false
            }

            if (
                filtrosAplicados.statusQuitacao !== 'TODOS' &&
                reg.statusQuitacao !== filtrosAplicados.statusQuitacao
            ) {
                return false
            }

            if (busca) {
                const textoConsolidado = [
                    reg.dia_evento,
                    reg.cidade_uf,
                    reg.artista,
                    reg.contato_nome_telefone,
                    formatarMoedaBRL(reg.receitaTotal),
                    formatarMoedaBRL(reg.despesaTotal),
                    formatarMoedaBRL(reg.valorLiquido),
                ]
                    .join(' ')
                    .toLowerCase()

                if (!textoConsolidado.includes(busca)) return false
            }

            if (
                filtrosAplicados.diasSelecionados.length > 0 &&
                !filtrosAplicados.diasSelecionados.includes(
                    reg.dia_evento.padStart(2, '0')
                )
            ) {
                return false
            }

            if (
                filtrosAplicados.ufsSelecionadas.length > 0 &&
                !filtrosAplicados.ufsSelecionadas.includes(reg.uf)
            ) {
                return false
            }

            if (
                filtrosAplicados.artistasSelecionados.length > 0 &&
                !filtrosAplicados.artistasSelecionados.includes(reg.artista)
            ) {
                return false
            }

            if (
                filtrosAplicados.textoReceitaMinima.trim() &&
                reg.receitaTotal < minReceita
            ) {
                return false
            }

            if (
                filtrosAplicados.textoDespesaMinima.trim() &&
                reg.despesaTotal < minDespesa
            ) {
                return false
            }

            if (
                filtrosAplicados.textoLiquidoMinimo.trim() &&
                reg.valorLiquido < minLiquido
            ) {
                return false
            }

            return true
        })
    }, [registrosCalculados, filtrosAplicados])

    const gerarConteudoPlanilha = () => {
        const cabecalhos = [
            'Data do Show',
            'Dia',
            'Cidade - UF',
            'Artista',
            'Contato',
            'Desconto (%)',
            'Receita Total (R$)',
            'Total Pago (R$)',
            'Falta Pagar (R$)',
            'Despesa Total (R$)',
            'Valor Líquido (R$)',
            'Parcelas Pagas',
        ]

        const linhas = registrosFiltrados.map((r) => [
            `"${r.data_evento.split('-').reverse().join('/')}"`,
            `"${r.dia_evento}"`,
            `"${r.cidade_uf}"`,
            `"${r.artista}"`,
            `"${r.contato_nome_telefone.replace(/"/g, '""')}"`,
            `"${r.desconto_percentual}%"`,
            `"${formatarMoedaBRL(r.receitaTotal)}"`,
            `"${formatarMoedaBRL(r.totalPago)}"`,
            `"${formatarMoedaBRL(r.totalFaltaPagar)}"`,
            `"${formatarMoedaBRL(r.despesaTotal)}"`,
            `"${formatarMoedaBRL(r.valorLiquido)}"`,
            `"${r.quantidadeParcelasPagas}/${r.quantidadeParcelasTotal}"`,
        ])

        return [cabecalhos.join(';'), ...linhas.map((l) => l.join(';'))].join(
            '\r\n'
        )
    }

    const exportarParaCsv = () => {
        const blob = new Blob(['\uFEFF' + gerarConteudoPlanilha()], {
            type: 'text/csv;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'financeiro_sarsplanner.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const exportarParaExcel = () => {
        const blob = new Blob(['\uFEFF' + gerarConteudoPlanilha()], {
            type: 'application/vnd.ms-excel;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'financeiro_sarsplanner.xls')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-2.5">
            <FiltroFinanceiro
                filtros={rascunhoFiltros}
                opcoesAnos={opcoesAnos}
                totalFiltrados={registrosFiltrados.length}
                quantidadeFiltrosColunaAtivos={quantidadeFiltrosColunaAtivos}
                aoAlterarCampo={atualizarCampoFiltro}
                aoFiltrar={aplicarFiltros}
                aoLimpar={limparFiltros}
                aoExportarCsv={exportarParaCsv}
                aoExportarExcel={exportarParaExcel}
                aoExportarPdf={() => window.print()}
            />

            <TabelaFinanceiro
                registrosFiltrados={registrosFiltrados}
                filtros={filtrosAplicados}
                opcoesArtistas={opcoesArtistas}
                opcoesUfs={opcoesUfs}
                aoAlterarCampoFiltro={atualizarCampoFiltro}
                aoAbrirDetalhamentoFinanceiro={(eventoId) =>
                    navigate(`/financeira/${eventoId}`)
                }
                aoAbrirModalDespesas={(reg) => setEventoModalDespesaId(reg.evento_id)}
            />

            <ModalDespesasEvento
                registroEvento={registroModalDespesaAtual}
                aoFechar={() => setEventoModalDespesaId(null)}
                aoAdicionarDespesa={adicionarDespesa}
                aoExcluirDespesa={excluirDespesa}
            />
        </div>
    )
}
