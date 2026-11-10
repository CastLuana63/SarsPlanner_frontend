import React, { createContext, useContext, useState, useEffect } from 'react'
import eventosMock from '@/mocks/eventosMock.json'
import statusEventosMock from '@/mocks/statusEventosMock.json'
import type {
    IEventosContexto,
    IEventoSistema,
    IFiltrosEventos,
    IStatusPersonalizadoEvento,
    TDadosFormularioEvento,
} from '@/types/evento.types'

const CHAVE_STORAGE_EVENTOS = '@SarsPlanner:listaEventos:v1'
const CHAVE_STORAGE_STATUS_EVENTOS = '@SarsPlanner:statusEventos:v1'
const CHAVE_STORAGE_FILTROS_EVENTOS = '@SarsPlanner:filtrosEventos:v1'

const ANO_ATUAL_PADRAO = String(new Date().getFullYear())

export const FILTROS_EVENTOS_INICIAIS: IFiltrosEventos = {
    ano: ANO_ATUAL_PADRAO,
    meses: [],
    realizado: 'TODOS',
    pesquisaGeral: '',
    artistasSelecionados: [],
    diasSelecionados: [],
    ufsSelecionadas: [],
    vendedoresSelecionados: [],
    statusSelecionados: [],
    textoValorShow: '',
    textoComissao: '',
    textoProducao: '',
    campoOrdenacao: 'data',
    direcaoOrdenacao: 'asc',
}

export const COORDENADAS_PADRAO_POR_UF: Record<
    string,
    { lat: number; lng: number; estado: string }
> = {
    SP: { lat: -23.5505, lng: -46.6333, estado: 'São Paulo' },
    MS: { lat: -20.4697, lng: -54.6201, estado: 'Mato Grosso do Sul' },
    PR: { lat: -25.4284, lng: -49.2733, estado: 'Paraná' },
    ES: { lat: -20.3155, lng: -40.3128, estado: 'Espírito Santo' },
    MG: { lat: -19.9167, lng: -43.9345, estado: 'Minas Gerais' },
    GO: { lat: -16.6869, lng: -49.2648, estado: 'Goiás' },
    SC: { lat: -27.5954, lng: -48.548, estado: 'Santa Catarina' },
    RJ: { lat: -22.9068, lng: -43.1729, estado: 'Rio de Janeiro' },
    RO: { lat: -8.7619, lng: -63.9039, estado: 'Rondônia' },
    BA: { lat: -12.9714, lng: -38.5014, estado: 'Bahia' },
}

const EventosContext = createContext<IEventosContexto | undefined>(undefined)

export const EventosProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [listaEventos, setListaEventos] = useState<IEventoSistema[]>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_EVENTOS)
        if (salvo) {
            try {
                return JSON.parse(salvo) as IEventoSistema[]
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_EVENTOS)
            }
        }
        return eventosMock as IEventoSistema[]
    })

    const [listaStatus, setListaStatus] = useState<IStatusPersonalizadoEvento[]>(
        () => {
            const salvo = localStorage.getItem(CHAVE_STORAGE_STATUS_EVENTOS)
            if (salvo) {
                try {
                    return JSON.parse(salvo) as IStatusPersonalizadoEvento[]
                } catch {
                    localStorage.removeItem(CHAVE_STORAGE_STATUS_EVENTOS)
                }
            }
            return statusEventosMock as IStatusPersonalizadoEvento[]
        }
    )

    const [filtrosEventos, setFiltrosEventos] = useState<IFiltrosEventos>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_FILTROS_EVENTOS)
        if (salvo) {
            try {
                return { ...FILTROS_EVENTOS_INICIAIS, ...JSON.parse(salvo) }
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_FILTROS_EVENTOS)
            }
        }
        return FILTROS_EVENTOS_INICIAIS
    })

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE_EVENTOS, JSON.stringify(listaEventos))
    }, [listaEventos])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_STATUS_EVENTOS,
            JSON.stringify(listaStatus)
        )
    }, [listaStatus])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FILTROS_EVENTOS,
            JSON.stringify(filtrosEventos)
        )
    }, [filtrosEventos])

    const atualizarCampoFiltroEvento = <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => {
        setFiltrosEventos((anterior) => ({
            ...anterior,
            [campo]: valor,
        }))
    }

    const limparTodosFiltrosEventos = () => {
        setFiltrosEventos(FILTROS_EVENTOS_INICIAIS)
        localStorage.removeItem(CHAVE_STORAGE_FILTROS_EVENTOS)
    }

    const adicionarEvento = (dados: TDadosFormularioEvento) => {
        const partesData = dados.data_evento.split('-')
        const ano_referencia = partesData[0] || ANO_ATUAL_PADRAO
        const mes_referencia = (partesData[1] || '01').padStart(2, '0')
        const dia_evento = (partesData[2] || '01').padStart(2, '0')

        const novoId =
            listaEventos.length > 0
                ? Math.max(...listaEventos.map((e) => e.id)) + 1
                : 101

        const novoEvento: IEventoSistema = {
            ...dados,
            id: novoId,
            dia_evento,
            mes_referencia,
            ano_referencia,
            cidade_uf: `${dados.cidade} - ${dados.uf}`,
        }

        setListaEventos((anterior) => [...anterior, novoEvento])
    }

    const atualizarEvento = (
        idEvento: number,
        dadosParciais: Partial<IEventoSistema>
    ) => {
        setListaEventos((anterior) =>
            anterior.map((ev) => {
                if (ev.id !== idEvento) return ev

                const atualizado: IEventoSistema = { ...ev, ...dadosParciais }

                if (dadosParciais.data_evento) {
                    const [ano, mes, dia] = dadosParciais.data_evento.split('-')
                    if (ano && mes && dia) {
                        atualizado.ano_referencia = ano
                        atualizado.mes_referencia = mes.padStart(2, '0')
                        atualizado.dia_evento = dia.padStart(2, '0')
                    }
                }

                if (dadosParciais.cidade !== undefined || dadosParciais.uf !== undefined) {
                    atualizado.cidade_uf = `${atualizado.cidade} - ${atualizado.uf}`
                }

                return atualizado
            })
        )
    }

    const excluirEvento = (idEvento: number) => {
        setListaEventos((anterior) => anterior.filter((ev) => ev.id !== idEvento))
    }

    const salvarOuAtualizarStatus = (
        idExistente: string | null,
        nome: string,
        corHex: string
    ): IStatusPersonalizadoEvento => {
        const nomePadronizado = nome.trim().toUpperCase()

        if (idExistente) {
            const atualizado: IStatusPersonalizadoEvento = {
                id: idExistente,
                nome: nomePadronizado,
                corHex,
            }
            setListaStatus((anterior) =>
                anterior.map((st) => (st.id === idExistente ? atualizado : st))
            )
            return atualizado
        }

        const novoId = nomePadronizado.replace(/\s+/g, '_')
        const novoStatus: IStatusPersonalizadoEvento = {
            id: novoId,
            nome: nomePadronizado,
            corHex,
        }

        setListaStatus((anterior) => {
            const jaExiste = anterior.some((st) => st.id === novoId)
            if (jaExiste) {
                return anterior.map((st) => (st.id === novoId ? novoStatus : st))
            }
            return [...anterior, novoStatus]
        })

        return novoStatus
    }

    const obterStatusPorId = (statusId: string): IStatusPersonalizadoEvento => {
        return (
            listaStatus.find((st) => st.id === statusId) ||
            listaStatus[0] || {
                id: 'PENDENTE',
                nome: 'PENDENTE',
                corHex: '#ef4444',
            }
        )
    }

    return (
        <EventosContext.Provider
            value={{
                listaEventos,
                listaStatus,
                filtrosEventos,
                atualizarCampoFiltroEvento,
                limparTodosFiltrosEventos,
                adicionarEvento,
                atualizarEvento,
                excluirEvento,
                salvarOuAtualizarStatus,
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
