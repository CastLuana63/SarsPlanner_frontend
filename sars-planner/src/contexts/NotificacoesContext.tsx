import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import alertasNotificacoesMock from '@/mocks/alertasNotificacoesMock.json'
import type {
    IAlertaNotificacao,
    IFiltrosAlertas,
    INotificacoesContexto,
} from '@/types/notificacao.types'

const CHAVE_STORAGE_ALERTAS = '@SarsPlanner:listaAlertas:v3'
const CHAVE_STORAGE_FILTROS_ALERTAS = '@SarsPlanner:filtrosAlertas:v3'

const ANO_ATUAL_PADRAO = String(new Date().getFullYear())

export const FILTROS_ALERTAS_INICIAIS: IFiltrosAlertas = {
    ano: ANO_ATUAL_PADRAO,
    meses: [],
    statusConclusao: 'NAO_CONCLUIDO',
    pesquisaGeral: '',
    diasSelecionados: [],
    ufsSelecionadas: [],
    artistasSelecionados: [],
    categoriasSelecionadas: [],
    campoOrdenacao: 'data',
    direcaoOrdenacao: 'desc',
}

const NotificacoesContext = createContext<INotificacoesContexto | undefined>(undefined)

export const NotificacoesProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [listaAlertas, setListaAlertas] = useState<IAlertaNotificacao[]>(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_ALERTAS)
        if (salvo) {
            try {
                return JSON.parse(salvo) as IAlertaNotificacao[]
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_ALERTAS)
            }
        }
        return alertasNotificacoesMock as IAlertaNotificacao[]
    })

    const [filtrosAplicados, setFiltrosAplicados] = useState<IFiltrosAlertas>(() => {
        const filtrosSalvos = localStorage.getItem(CHAVE_STORAGE_FILTROS_ALERTAS)
        if (filtrosSalvos) {
            try {
                const parseado = JSON.parse(filtrosSalvos)
                return {
                    ...FILTROS_ALERTAS_INICIAIS,
                    ...parseado,
                    meses: Array.isArray(parseado.meses) ? parseado.meses : [],
                    diasSelecionados: Array.isArray(parseado.diasSelecionados)
                        ? parseado.diasSelecionados
                        : [],
                    ufsSelecionadas: Array.isArray(parseado.ufsSelecionadas)
                        ? parseado.ufsSelecionadas
                        : [],
                    artistasSelecionados: Array.isArray(parseado.artistasSelecionados)
                        ? parseado.artistasSelecionados
                        : [],
                    categoriasSelecionadas: Array.isArray(parseado.categoriasSelecionadas)
                        ? parseado.categoriasSelecionadas
                        : [],
                }
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_FILTROS_ALERTAS)
            }
        }
        return FILTROS_ALERTAS_INICIAIS
    })

    const [rascunhoFiltros, setRascunhoFiltros] =
        useState<IFiltrosAlertas>(filtrosAplicados)

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE_ALERTAS, JSON.stringify(listaAlertas))
    }, [listaAlertas])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FILTROS_ALERTAS,
            JSON.stringify(filtrosAplicados)
        )
    }, [filtrosAplicados])

    const cincoAlertasMaisRecentes = useMemo<IAlertaNotificacao[]>(() => {
        return [...listaAlertas]
            .sort((a, b) => {
                if (a.concluida !== b.concluida) return a.concluida ? 1 : -1
                if (a.lida !== b.lida) return a.lida ? 1 : -1
                return b.data_vencimento_iso.localeCompare(a.data_vencimento_iso)
            })
            .slice(0, 5)
    }, [listaAlertas])

    const quantidadeNaoLidasRecentes = useMemo<number>(() => {
        return listaAlertas.filter((item) => !item.lida && !item.concluida).length
    }, [listaAlertas])

    const atualizarCampoRascunhoFiltro = <K extends keyof IFiltrosAlertas>(
        campo: K,
        valor: IFiltrosAlertas[K]
    ) => {
        setRascunhoFiltros((estadoAnterior) => {
            const novoRascunho = { ...estadoAnterior, [campo]: valor }
            setFiltrosAplicados(novoRascunho)
            return novoRascunho
        })
    }

    const aplicarFiltrosAlertas = () => {
        setFiltrosAplicados(rascunhoFiltros)
    }

    const limparFiltrosAlertas = () => {
        setRascunhoFiltros(FILTROS_ALERTAS_INICIAIS)
        setFiltrosAplicados(FILTROS_ALERTAS_INICIAIS)
        localStorage.removeItem(CHAVE_STORAGE_FILTROS_ALERTAS)
    }

    const marcarAlertaComoLido = (idAlerta: number) => {
        setListaAlertas((listaAnterior) =>
            listaAnterior.map((item) =>
                item.id === idAlerta ? { ...item, lida: true } : item
            )
        )
    }

    const marcarTodasComoLidas = () => {
        setListaAlertas((listaAnterior) =>
            listaAnterior.map((item) => ({ ...item, lida: true }))
        )
    }

    const alternarConclusaoAlerta = (idAlerta: number) => {
        setListaAlertas((listaAnterior) =>
            listaAnterior.map((item) =>
                item.id === idAlerta
                    ? { ...item, concluida: !item.concluida, lida: true }
                    : item
            )
        )
    }

    return (
        <NotificacoesContext.Provider
            value={{
                listaAlertas,
                cincoAlertasMaisRecentes,
                quantidadeNaoLidasRecentes,
                filtrosAplicados,
                rascunhoFiltros,
                atualizarCampoRascunhoFiltro,
                aplicarFiltrosAlertas,
                limparFiltrosAlertas,
                marcarAlertaComoLido,
                marcarTodasComoLidas,
                alternarConclusaoAlerta,
            }}
        >
            {children}
        </NotificacoesContext.Provider>
    )
}

export const useNotificacoes = (): INotificacoesContexto => {
    const contexto = useContext(NotificacoesContext)
    if (!contexto) {
        throw new Error(
            'useNotificacoes deve ser utilizado dentro de um NotificacoesProvider'
        )
    }
    return contexto
}
