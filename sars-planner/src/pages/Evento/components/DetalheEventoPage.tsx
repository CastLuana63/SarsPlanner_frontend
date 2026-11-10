import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Trash2,
    DollarSign,
    CheckCircle2,
} from 'lucide-react'
import artistasMock from '@/mocks/artistasMock.json'
import { useEventos } from '@/contexts/EventosContext'
import type { IDistanciaCidadeEvento } from '@/types/evento.types'
import type { IArtista } from '@/types/artista.types'
import { ModalStatusEvento } from './ModalStatusEvento'
import { MapaRotasEvento } from './MapaRotasEvento'
import { PainelCidadesDistancia } from './PainelCidadesDistancia'

const calcularDistanciaETempoRodoviario = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): { distanciaKm: number; tempoMinutos: number; tempoEstimadoTexto: string } => {
    const raioTerraKm = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distanciaLinhaReta = raioTerraKm * c
    const distanciaKm = Math.max(1, Math.round(distanciaLinhaReta * 1.28))
    // velocidade média rodoviária estimada de 78 km/h
    const tempoMinutos = Math.max(5, Math.round((distanciaKm / 78) * 60))
    const horas = Math.floor(tempoMinutos / 60)
    const minutos = tempoMinutos % 60
    const tempoEstimadoTexto =
        horas > 0 ? `${horas}h ${String(minutos).padStart(2, '0')}m` : `${minutos} min`

    return { distanciaKm, tempoMinutos, tempoEstimadoTexto }
}

export const DetalheEventoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {
        listaEventos,
        listaStatus,
        atualizarEvento,
        excluirEvento,
        salvarStatusCustom,
        obterStatusPorId,
    } = useEventos()

    const listaArtistas = artistasMock as IArtista[]
    const eventoAtual = useMemo(
        () => listaEventos.find((e) => String(e.id) === String(id)) || null,
        [listaEventos, id]
    )

    const [cidadeInput, setCidadeInput] = useState('')
    const [ufInput, setUfInput] = useState('')
    const [dataInput, setDataInput] = useState('')
    const [horaInicioInput, setHoraInicioInput] = useState('')
    const [horaFimInput, setHoraFimInput] = useState('')
    const [valorShowInput, setValorShowInput] = useState('')
    const [comissaoInput, setComissaoInput] = useState('')
    const [vendedorInput, setVendedorInput] = useState('')
    const [producaoInput, setProducaoInput] = useState('')

    const [modalStatusAberto, setModalStatusAberto] = useState(false)
    const [cidadeRotaSelecionada, setCidadeRotaSelecionada] =
        useState<IDistanciaCidadeEvento | null>(null)
    const [avisoSalvoAutomatico, setAvisoSalvoAutomatico] = useState(false)
    const [avisoPagamentos, setAvisoPagamentos] = useState(false)

    useEffect(() => {
        if (!eventoAtual) return
        setCidadeInput(eventoAtual.cidade)
        setUfInput(eventoAtual.uf)
        setDataInput(eventoAtual.data_evento)
        setHoraInicioInput(eventoAtual.horario_inicio)
        setHoraFimInput(eventoAtual.horario_fim)
        setValorShowInput(eventoAtual.valor_show)
        setComissaoInput(eventoAtual.comissao)
        setVendedorInput(eventoAtual.vendedor)
        setProducaoInput(eventoAtual.producao)
    }, [eventoAtual])

    const cidadesSecundariasCalculadas = useMemo<IDistanciaCidadeEvento[]>(() => {
        if (!eventoAtual) return []

        const mapaPorCidade = new Map<string, IDistanciaCidadeEvento>()

        for (const ev of listaEventos) {
            if (
                ev.id === eventoAtual.id ||
                ev.cidade_uf.toLowerCase() === eventoAtual.cidade_uf.toLowerCase()
            ) {
                continue
            }

            const calculo = calcularDistanciaETempoRodoviario(
                ev.latitude,
                ev.longitude,
                eventoAtual.latitude,
                eventoAtual.longitude
            )

            mapaPorCidade.set(ev.cidade_uf.toUpperCase(), {
                eventoId: ev.id,
                cidade: ev.cidade,
                uf: ev.uf,
                cidade_uf: ev.cidade_uf,
                artista: ev.artista,
                data_evento: ev.data_evento,
                latitude: ev.latitude,
                longitude: ev.longitude,
                distanciaKm: calculo.distanciaKm,
                tempoMinutos: calculo.tempoMinutos,
                tempoEstimadoTexto: calculo.tempoEstimadoTexto,
            })
        }

        return Array.from(mapaPorCidade.values()).sort(
            (a, b) => a.distanciaKm - b.distanciaKm
        )
    }, [eventoAtual, listaEventos])

    if (!eventoAtual) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3">
                <p className="text-xs text-slate-500">Evento não encontrado.</p>
                <button
                    type="button"
                    onClick={() => navigate('/eventos')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1056f5] text-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para Eventos</span>
                </button>
            </div>
        )
    }

    const statusAtualObj = obterStatusPorId(eventoAtual.status_id)

    const dispararFeedbackSalvo = () => {
        setAvisoSalvoAutomatico(true)
        setTimeout(() => setAvisoSalvoAutomatico(false), 1600)
    }

    const confirmarAoPressionarEnter = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur()
        }
    }

    const manipularExcluirEvento = () => {
        excluirEvento(eventoAtual.id)
        navigate('/eventos')
    }

    const classeCampoInline =
        'w-full h-7 rounded-md border border-transparent hover:border-slate-300 focus:border-[#1056f5] bg-slate-50/70 focus:bg-white px-2 text-[11px] font-semibold text-slate-800 focus:outline-none transition-all'

    return (
        <div className="space-y-3">
            <section className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => navigate('/eventos')}
                            title="Voltar para a lista de eventos"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold text-slate-900">
                                    {eventoAtual.artista} - {eventoAtual.cidade_uf}
                                </h1>
                                {avisoSalvoAutomatico && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1056f5]">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Atualizado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {/* <button
                            type="button"
                            onClick={() => {
                                setCidadeRotaSelecionada(null)
                                dispararFeedbackSalvo()
                            }}
                            className="h-7 inline-flex items-center gap-1.5 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-2.5 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                        >
                            <Navigation className="w-3 h-3" />
                            <span>Calcular Distância</span>
                        </button> */}

                        <button
                            type="button"
                            onClick={() => setAvisoPagamentos((v) => !v)}
                            className="h-7 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 text-[11px] font-semibold transition cursor-pointer"
                        >
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span>Ver Pagamentos</span>
                        </button>

                        <button
                            type="button"
                            onClick={manipularExcluirEvento}
                            className="h-7 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 text-[11px] font-semibold transition cursor-pointer"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                        </button>
                    </div>
                </div>

                {avisoPagamentos && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] text-blue-800 flex items-center justify-between">
                        <span>
                            Integração financeira do evento{' '}
                            <strong>#{eventoAtual.id} ({eventoAtual.cidade_uf})</strong> pronta
                            para a próxima etapa do módulo Financeiro.
                        </span>
                        <button
                            type="button"
                            onClick={() => setAvisoPagamentos(false)}
                            className="text-[10px] font-bold underline cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Artista
                        </label>
                        <select
                            value={eventoAtual.artista}
                            onChange={(e) => {
                                atualizarEvento(eventoAtual.id, { artista: e.target.value })
                                dispararFeedbackSalvo()
                            }}
                            className={`${classeCampoInline} cursor-pointer`}
                        >
                            {listaArtistas.map((art) => (
                                <option key={art.id} value={art.nome_social}>
                                    {art.nome_social} — {art.nome_artista}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Data do Show
                        </label>
                        <input
                            type="date"
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (dataInput && dataInput !== eventoAtual.data_evento) {
                                    atualizarEvento(eventoAtual.id, { data_evento: dataInput })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Cidade Principal
                        </label>
                        <input
                            type="text"
                            value={cidadeInput}
                            onChange={(e) => setCidadeInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (
                                    cidadeInput.trim() &&
                                    cidadeInput.trim() !== eventoAtual.cidade
                                ) {
                                    atualizarEvento(eventoAtual.id, {
                                        cidade: cidadeInput.trim(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            UF
                        </label>
                        <input
                            type="text"
                            maxLength={2}
                            value={ufInput}
                            onChange={(e) => setUfInput(e.target.value.toUpperCase())}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (ufInput.trim() && ufInput.trim() !== eventoAtual.uf) {
                                    atualizarEvento(eventoAtual.id, {
                                        uf: ufInput.trim().toUpperCase(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Horário (Início / Fim)
                        </label>
                        <div className="flex items-center gap-1">
                            <input
                                type="time"
                                value={horaInicioInput}
                                onChange={(e) => setHoraInicioInput(e.target.value)}
                                onKeyDown={confirmarAoPressionarEnter}
                                onBlur={() => {
                                    if (horaInicioInput !== eventoAtual.horario_inicio) {
                                        atualizarEvento(eventoAtual.id, {
                                            horario_inicio: horaInicioInput,
                                        })
                                        dispararFeedbackSalvo()
                                    }
                                }}
                                className={classeCampoInline}
                            />
                            <input
                                type="time"
                                value={horaFimInput}
                                onChange={(e) => setHoraFimInput(e.target.value)}
                                onKeyDown={confirmarAoPressionarEnter}
                                onBlur={() => {
                                    if (horaFimInput !== eventoAtual.horario_fim) {
                                        atualizarEvento(eventoAtual.id, {
                                            horario_fim: horaFimInput,
                                        })
                                        dispararFeedbackSalvo()
                                    }
                                }}
                                className={classeCampoInline}
                            />
                        </div>
                    </div>

                    {/* Realizado (Select Editável) */}
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Realizado
                        </label>
                        <select
                            value={eventoAtual.realizado ? 'SIM' : 'NAO'}
                            onChange={(e) => {
                                atualizarEvento(eventoAtual.id, {
                                    realizado: e.target.value === 'SIM',
                                })
                                dispararFeedbackSalvo()
                            }}
                            className={`${classeCampoInline} cursor-pointer`}
                        >
                            <option value="NAO">Não Realizado</option>
                            <option value="SIM">Realizado</option>
                        </select>
                    </div>

                    {/* Valor Show */}
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Valor Show
                        </label>
                        <input
                            type="text"
                            value={valorShowInput}
                            onChange={(e) => setValorShowInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (valorShowInput !== eventoAtual.valor_show) {
                                    atualizarEvento(eventoAtual.id, {
                                        valor_show: valorShowInput.toUpperCase(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    {/* Comissão */}
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Comissão
                        </label>
                        <input
                            type="text"
                            value={comissaoInput}
                            onChange={(e) => setComissaoInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (comissaoInput !== eventoAtual.comissao) {
                                    atualizarEvento(eventoAtual.id, {
                                        comissao: comissaoInput.toUpperCase(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    {/* Vendedor */}
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Vendedor
                        </label>
                        <input
                            type="text"
                            value={vendedorInput}
                            onChange={(e) => setVendedorInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (vendedorInput !== eventoAtual.vendedor) {
                                    atualizarEvento(eventoAtual.id, {
                                        vendedor: vendedorInput.toUpperCase(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    {/* Produção */}
                    <div>
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Produção
                        </label>
                        <input
                            type="text"
                            value={producaoInput}
                            onChange={(e) => setProducaoInput(e.target.value)}
                            onKeyDown={confirmarAoPressionarEnter}
                            onBlur={() => {
                                if (producaoInput !== eventoAtual.producao) {
                                    atualizarEvento(eventoAtual.id, {
                                        producao: producaoInput.toUpperCase(),
                                    })
                                    dispararFeedbackSalvo()
                                }
                            }}
                            className={classeCampoInline}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Status
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onDoubleClick={() => setModalStatusAberto(true)}
                                style={{ backgroundColor: statusAtualObj.corHex }}
                                className="w-4 h-4 rounded-full shrink-0 cursor-pointer ring-2 ring-offset-1 ring-slate-300 hover:scale-120 transition-transform"
                            />
                            <select
                                value={eventoAtual.status_id}
                                onChange={(e) => {
                                    atualizarEvento(eventoAtual.id, { status_id: e.target.value })
                                    dispararFeedbackSalvo()
                                }}
                                className={`${classeCampoInline} cursor-pointer flex-1`}
                            >
                                {listaStatus.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.rotulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-7 xl:col-span-8">
                    <MapaRotasEvento
                        eventoPrincipal={eventoAtual}
                        cidadesSecundarias={cidadesSecundariasCalculadas}
                        cidadeRotaSelecionada={cidadeRotaSelecionada}
                        aoSelecionarCidadeNoMapa={setCidadeRotaSelecionada}
                    />
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <PainelCidadesDistancia
                        eventoPrincipal={eventoAtual}
                        cidadesCalculadas={cidadesSecundariasCalculadas}
                        cidadeSelecionada={cidadeRotaSelecionada}
                        aoSelecionarCidade={setCidadeRotaSelecionada}
                    />
                </div>
            </div>

            <ModalStatusEvento
                aberto={modalStatusAberto}
                statusInicial={statusAtualObj}
                listaStatusExistentes={listaStatus}
                aoFechar={() => setModalStatusAberto(false)}
                aoSalvarStatus={(novoStatus) => {
                    salvarStatusCustom(novoStatus)
                    atualizarEvento(eventoAtual.id, { status_id: novoStatus.id })
                    dispararFeedbackSalvo()
                }}
            />
        </div>
    )
}
