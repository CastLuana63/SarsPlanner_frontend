import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventos } from '@/contexts/EventosContext'
import { FiltroEventos } from './components/FiltroEventos'
import { TabelaEventos } from './components/TabelaEventos'
import { ModalLateralEvento } from './components/ModalLateralEvento'
import { ModalStatusEvento } from './components/ModalStatusEvento'
import type { IEvento, IStatusEventoCustom } from '@/types/evento.types'

export const EventosPage: React.FC = () => {
    const navigate = useNavigate()
    const {
        listaEventos,
        listaStatus,
        filtrosAplicados,
        rascunhoFiltros,
        atualizarCampoFiltro,
        aplicarFiltros,
        limparFiltros,
        adicionarEvento,
        atualizarEvento,
        excluirEvento,
        salvarStatusCustom,
        obterStatusPorId,
    } = useEventos()

    const [modalLateralAberto, setModalLateralAberto] = useState(false)
    const [eventoEmEdicao, setEventoEmEdicao] = useState<IEvento | null>(null)
    const [statusParaModal, setStatusParaModal] =
        useState<IStatusEventoCustom | null>(null)

    const opcoesAnos = useMemo(() => {
        const anoAtual = String(new Date().getFullYear())
        const conj = new Set([
            anoAtual,
            ...listaEventos.map((e) => e.ano_referencia),
        ])
        return Array.from(conj).sort((a, b) => b.localeCompare(a))
    }, [listaEventos])

    const opcoesArtistas = useMemo(() => {
        return Array.from(new Set(listaEventos.map((e) => e.artista))).sort()
    }, [listaEventos])

    const opcoesUfs = useMemo(() => {
        return Array.from(new Set(listaEventos.map((e) => e.uf))).sort()
    }, [listaEventos])

    const opcoesVendedores = useMemo(() => {
        return Array.from(new Set(listaEventos.map((e) => e.vendedor))).sort()
    }, [listaEventos])

    const quantidadeFiltrosColunaAtivos = useMemo(() => {
        let c = 0
        if (filtrosAplicados.diasSelecionados.length > 0) c++
        if (filtrosAplicados.ufsSelecionadas.length > 0) c++
        if (filtrosAplicados.artistasSelecionados.length > 0) c++
        if (filtrosAplicados.vendedoresSelecionados.length > 0) c++
        if (filtrosAplicados.statusSelecionados.length > 0) c++
        if (filtrosAplicados.textoValorShow.trim()) c++
        if (filtrosAplicados.textoComissao.trim()) c++
        if (filtrosAplicados.textoProducao.trim()) c++
        return c
    }, [filtrosAplicados])

    const eventosFiltrados = useMemo<IEvento[]>(() => {
        const busca = filtrosAplicados.pesquisaGeral.trim().toLowerCase()

        return listaEventos.filter((ev) => {
            if (
                filtrosAplicados.ano !== 'TODOS' &&
                ev.ano_referencia !== filtrosAplicados.ano
            ) {
                return false
            }

            if (
                filtrosAplicados.meses.length > 0 &&
                !filtrosAplicados.meses.includes(ev.mes_referencia.padStart(2, '0'))
            ) {
                return false
            }

            if (filtrosAplicados.realizado === 'REALIZADO' && !ev.realizado) {
                return false
            }
            if (filtrosAplicados.realizado === 'NAO_REALIZADO' && ev.realizado) {
                return false
            }

            if (busca) {
                const textoLinha = [
                    ev.artista,
                    ev.dia_evento,
                    ev.cidade_uf,
                    ev.valor_show,
                    ev.comissao,
                    ev.vendedor,
                    ev.producao,
                    obterStatusPorId(ev.status_id).rotulo,
                ]
                    .join(' ')
                    .toLowerCase()
                if (!textoLinha.includes(busca)) return false
            }

            if (
                filtrosAplicados.diasSelecionados.length > 0 &&
                !filtrosAplicados.diasSelecionados.includes(
                    ev.dia_evento.padStart(2, '0')
                )
            ) {
                return false
            }

            if (
                filtrosAplicados.ufsSelecionadas.length > 0 &&
                !filtrosAplicados.ufsSelecionadas.includes(ev.uf)
            ) {
                return false
            }

            if (
                filtrosAplicados.artistasSelecionados.length > 0 &&
                !filtrosAplicados.artistasSelecionados.includes(ev.artista)
            ) {
                return false
            }

            if (
                filtrosAplicados.vendedoresSelecionados.length > 0 &&
                !filtrosAplicados.vendedoresSelecionados.includes(ev.vendedor)
            ) {
                return false
            }

            if (
                filtrosAplicados.statusSelecionados.length > 0 &&
                !filtrosAplicados.statusSelecionados.includes(ev.status_id)
            ) {
                return false
            }

            if (
                filtrosAplicados.textoValorShow.trim() &&
                !ev.valor_show
                    .toLowerCase()
                    .includes(filtrosAplicados.textoValorShow.trim().toLowerCase())
            ) {
                return false
            }

            if (
                filtrosAplicados.textoComissao.trim() &&
                !ev.comissao
                    .toLowerCase()
                    .includes(filtrosAplicados.textoComissao.trim().toLowerCase())
            ) {
                return false
            }

            if (
                filtrosAplicados.textoProducao.trim() &&
                !ev.producao
                    .toLowerCase()
                    .includes(filtrosAplicados.textoProducao.trim().toLowerCase())
            ) {
                return false
            }

            return true
        })
    }, [listaEventos, filtrosAplicados, obterStatusPorId])

    const manipularSalvarEventoLateral = (dados: Omit<IEvento, 'id'>) => {
        if (eventoEmEdicao) {
            atualizarEvento(eventoEmEdicao.id, dados)
        } else {
            adicionarEvento(dados)
        }
        setEventoEmEdicao(null)
        setModalLateralAberto(false)
    }

    const exportarParaCsv = () => {
        const cabecalhos = [
            'Realizado',
            'Artista',
            'Data',
            'Cidade - UF',
            'Valor Show',
            'Comissão',
            'Vendedor',
            'Produção',
            'Status',
        ]
        const linhas = eventosFiltrados.map((ev) => [
            `"${ev.realizado ? 'SIM' : 'NÃO'}"`,
            `"${ev.artista}"`,
            `"${ev.data_evento}"`,
            `"${ev.cidade_uf}"`,
            `"${ev.valor_show}"`,
            `"${ev.comissao}"`,
            `"${ev.vendedor}"`,
            `"${ev.producao}"`,
            `"${obterStatusPorId(ev.status_id).rotulo}"`,
        ])
        const csv = [
            cabecalhos.join(';'),
            ...linhas.map((l) => l.join(';')),
        ].join('\r\n')
        const blob = new Blob(['\uFEFF' + csv], {
            type: 'text/csv;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'eventos_sarsplanner.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-2.5">
            <FiltroEventos
                filtros={rascunhoFiltros}
                opcoesAnos={opcoesAnos}
                totalFiltrados={eventosFiltrados.length}
                quantidadeFiltrosColunaAtivos={quantidadeFiltrosColunaAtivos}
                aoAlterarCampo={atualizarCampoFiltro}
                aoFiltrar={aplicarFiltros}
                aoLimpar={limparFiltros}
                aoAbrirNovoEvento={() => {
                    setEventoEmEdicao(null)
                    setModalLateralAberto(true)
                }}
                aoExportarCsv={exportarParaCsv}
                aoExportarPdf={() => window.print()}
            />

            <TabelaEventos
                eventosFiltrados={eventosFiltrados}
                filtros={filtrosAplicados}
                listaStatus={listaStatus}
                opcoesArtistas={opcoesArtistas}
                opcoesUfs={opcoesUfs}
                opcoesVendedores={opcoesVendedores}
                obterStatusPorId={obterStatusPorId}
                aoAlterarCampoFiltro={atualizarCampoFiltro}
                aoAlternarRealizado={(ev) =>
                    atualizarEvento(ev.id, { realizado: !ev.realizado })
                }
                aoAbrirModalStatus={(st) => setStatusParaModal(st)}
                aoAbrirDetalhesMapa={(ev) => navigate(`/eventos/${ev.id}`)}
                aoClicarEditar={(ev) => {
                    setEventoEmEdicao(ev)
                    setModalLateralAberto(true)
                }}
                aoClicarExcluir={(ev) => excluirEvento(ev.id)}
            />

            <ModalLateralEvento
                aberto={modalLateralAberto}
                eventoEmEdicao={eventoEmEdicao}
                listaStatus={listaStatus}
                aoFechar={() => {
                    setModalLateralAberto(false)
                    setEventoEmEdicao(null)
                }}
                aoSalvar={manipularSalvarEventoLateral}
            />

            <ModalStatusEvento
                aberto={Boolean(statusParaModal)}
                statusInicial={statusParaModal}
                listaStatusExistentes={listaStatus}
                aoFechar={() => setStatusParaModal(null)}
                aoSalvarStatus={salvarStatusCustom}
            />
        </div>
    )
}
