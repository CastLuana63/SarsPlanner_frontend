import React, { createContext, useContext, useState, useEffect } from 'react'
import eventosMock from '@/mocks/eventosMock.json'
import statusEventosMock from '@/mocks/statusEventosMock.json'
import type {
    IEvento,
    IEventosContexto,
    IFiltrosEventos,
    IStatusEventoCustom,
} from '@/types/evento.types'

const CHAVE_STORAGE_EVENTOS = '@SarsPlanner:listaEventos:v1'
const CHAVE_STORAGE_STATUS = '@SarsPlanner:statusEventos:v1'
const CHAVE_STORAGE_FILTROS_EVENTOS = '@SarsPlanner:filtrosEventos:v1'

export const COORDENADAS_CIDADES_PADRAO: Record<
    string,
    { lat: number; lng: number }
> = {
    'CAMPO GRANDE': { lat: -20.4697, lng: -54.6201 },
    GUARULHOS: { lat: -23.4543, lng: -46.5337 },
    CORUMBÁ: { lat: -19.008, lng: -57.651 },
    CORUMBA: { lat: -19.008, lng: -57.651 },
    'CAMPINA DA LAGOA': { lat: -24.5886, lng: -52.8019 },
    'RIBEIRÃO PRETO': { lat: -21.1704, lng: -47.8103 },
    'RIBEIRAO PRETO': { lat: -21.1704, lng: -47.8103 },
    CURITIBA: { lat: -25.4284, lng: -49.2733 },
    'SÃO PAULO': { lat: -23.5505, lng: -46.6333 },
    GOIÂNIA: { lat: -16.6869, lng: -49.2648 },
    UBERLÂNDIA: { lat: -18.9186, lng: -48.2772 },
    FLORIANÓPOLIS: { lat: -27.5954, lng: -48.548 },
}

export const obterCoordenadasCidade = (
    cidade: string,
    idSemente = 1
): { latitude: number; longitude: number } => {
    const chave = cidade.trim().toUpperCase()
    if (COORDENADAS_CIDADES_PADRAO[chave]) {
        return {
            latitude: COORDENADAS_CIDADES_PADRAO[chave].lat,
            longitude: COORDENADAS_CIDADES_PADRAO[chave].lng,
        }
    }
    const deslocamentoLat = ((idSemente * 17) % 80) * 0.08
    const deslocamentoLng = ((idSemente * 29) % 80) * 0.08
    return {
        latitude: -22.5 + deslocamentoLat,
        longitude: -49.5 + deslocamentoLng,
    }
}

export const FILTROS_EVENTOS_INICIAIS: IFiltrosEventos = {
    ano: String(new Date().getFullYear()),
    meses: [],
    realizado: 'TODOS',
    pesquisaGeral: '',
    diasSelecionados: [],
    ufsSelecionadas: [],
    artistasSelecionados: [],
    vendedoresSelecionados: [],
    statusSelecionados: [],
    textoValorShow: '',
    textoComissao: '',
    textoProducao: '',
    campoOrdenacao: 'data',
    direcaoOrdenacao: 'desc',
}

const EventosContext = createContext<IEventosContexto | undefined>(undefined)

export const EventosProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [listaEventos, setListaEventos] = useState<IEvento[]>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_EVENTOS)
        if (salvo) {
            try {
                return JSON.parse(salvo) as IEvento[]
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_EVENTOS)
            }
        }
        return eventosMock as IEvento[]
    })

    const [listaStatus, setListaStatus] = useState<IStatusEventoCustom[]>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_STATUS)
        if (salvo) {
            try {
                return JSON.parse(salvo) as IStatusEventoCustom[]
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_STATUS)
            }
        }
        return statusEventosMock as IStatusEventoCustom[]
    })

    const [filtrosAplicados, setFiltrosAplicados] = useState<IFiltrosEventos>(
        () => {
            const salvo = localStorage.getItem(CHAVE_STORAGE_FILTROS_EVENTOS)
            if (salvo) {
                try {
                    return { ...FILTROS_EVENTOS_INICIAIS, ...JSON.parse(salvo) }
                } catch {
                    localStorage.removeItem(CHAVE_STORAGE_FILTROS_EVENTOS)
                }
            }
            return FILTROS_EVENTOS_INICIAIS
        }
    )

    const [rascunhoFiltros, setRascunhoFiltros] =
        useState<IFiltrosEventos>(filtrosAplicados)

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE_EVENTOS, JSON.stringify(listaEventos))
    }, [listaEventos])

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE_STATUS, JSON.stringify(listaStatus))
    }, [listaStatus])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FILTROS_EVENTOS,
            JSON.stringify(filtrosAplicados)
        )
    }, [filtrosAplicados])

    const atualizarCampoFiltro = <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => {
        setRascunhoFiltros((anterior) => {
            const atualizado = { ...anterior, [campo]: valor }
            setFiltrosAplicados(atualizado)
            return atualizado
        })
    }

    const aplicarFiltros = () => {
        setFiltrosAplicados(rascunhoFiltros)
    }

    const limparFiltros = () => {
        setRascunhoFiltros(FILTROS_EVENTOS_INICIAIS)
        setFiltrosAplicados(FILTROS_EVENTOS_INICIAIS)
        localStorage.removeItem(CHAVE_STORAGE_FILTROS_EVENTOS)
    }

    const adicionarEvento = (novo: Omit<IEvento, 'id'>) => {
        setListaEventos((anterior) => {
            const novoId =
                anterior.length > 0 ? Math.max(...anterior.map((e) => e.id)) + 1 : 101
            const coords =
                novo.latitude && novo.longitude
                    ? { latitude: novo.latitude, longitude: novo.longitude }
                    : obterCoordenadasCidade(novo.cidade, novoId)

            const registroCompleto: IEvento = {
                ...novo,
                id: novoId,
                latitude: coords.latitude,
                longitude: coords.longitude,
            }
            return [...anterior, registroCompleto]
        })
    }

    const atualizarEvento = (id: number, dadosParciais: Partial<IEvento>) => {
        setListaEventos((anterior) =>
            anterior.map((item) => {
                if (item.id !== id) return item
                const atualizado = { ...item, ...dadosParciais }

                if (dadosParciais.data_evento) {
                    const [ano, mes, dia] = dadosParciais.data_evento.split('-')
                    atualizado.ano_referencia = ano || item.ano_referencia
                    atualizado.mes_referencia = mes || item.mes_referencia
                    atualizado.dia_evento = dia || item.dia_evento
                }

                if (
                    dadosParciais.cidade !== undefined ||
                    dadosParciais.uf !== undefined
                ) {
                    const cidadeLimpa = (dadosParciais.cidade ?? item.cidade).trim()
                    const ufLimpa = (dadosParciais.uf ?? item.uf).trim().toUpperCase()
                    atualizado.cidade = cidadeLimpa
                    atualizado.uf = ufLimpa
                    atualizado.cidade_uf = `${cidadeLimpa} - ${ufLimpa}`
                    const novasCoords = obterCoordenadasCidade(cidadeLimpa, item.id)
                    atualizado.latitude = novasCoords.latitude
                    atualizado.longitude = novasCoords.longitude
                }

                return atualizado
            })
        )
    }

    const excluirEvento = (id: number) => {
        setListaEventos((anterior) => anterior.filter((item) => item.id !== id))
    }

    const salvarStatusCustom = (novoStatus: IStatusEventoCustom) => {
        setListaStatus((anterior) => {
            const existe = anterior.some((s) => s.id === novoStatus.id)
            if (existe) {
                return anterior.map((s) => (s.id === novoStatus.id ? novoStatus : s))
            }
            return [...anterior, novoStatus]
        })
    }

    const obterStatusPorId = (statusId: string): IStatusEventoCustom => {
        return (
            listaStatus.find((s) => s.id === statusId) || {
                id: statusId,
                rotulo: statusId,
                corHex: '#ef4444',
            }
        )
    }

    return (
        <EventosContext.Provider
            value={{
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
            }}
        >
            {children}
        </EventosContext.Provider>
    )
}

export const useEventos = (): IEventosContexto => {
    const contexto = useContext(EventosContext)
    if (!contexto) {
        throw new Error('useEventos deve ser utilizado dentro de um EventosProvider')
    }
    return contexto
}
