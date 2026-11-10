import React, { useState, useRef, useEffect } from 'react'
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Pencil,
    Trash2,
    Calendar,
    Mail,
    Phone,
    ChevronDown,
    Filter,
    Check,
    Search,
} from 'lucide-react'
import {
    ContainerGridPadrao,
    ESTILOS_PADRAO_GRID,
    obterClasseBotaoColunaAzul,
} from '@/components/ui/PadraoGrid'
import type {
    IArtista,
    IConfiguracaoOrdenacaoArtista,
    IFiltrosColunaArtista,
    TColunaFiltroArtista,
    TColunaOrdenavelArtista,
} from '@/types/artista.types'

interface IOpcoesUnicasColunasArtista {
    nomesArtistas: string[]
    nomesSociais: string[]
    emails: string[]
    telefones: string[]
    quantidadesEventos: string[]
}

interface ITabelaArtistasProps {
    listaArtistas: IArtista[]
    opcoesColunas: IOpcoesUnicasColunasArtista
    filtrosColuna: IFiltrosColunaArtista
    ordenacaoAtual: IConfiguracaoOrdenacaoArtista
    aoAlterarFiltroColuna: <K extends keyof IFiltrosColunaArtista>(
        campo: K,
        valor: IFiltrosColunaArtista[K]
    ) => void
    aoLimparColunaEspecifica: (coluna: TColunaFiltroArtista) => void
    aoAlternarOrdenacao: (coluna: TColunaOrdenavelArtista) => void
    aoClicarEditar: (artista: IArtista) => void
    aoClicarExcluir: (artista: IArtista) => void
}

const extrairApenasNumeros = (valor: string): string => valor.replace(/\D/g, '')

export const TabelaArtistas: React.FC<ITabelaArtistasProps> = ({
    listaArtistas,
    opcoesColunas,
    filtrosColuna,
    ordenacaoAtual,
    aoAlterarFiltroColuna,
    aoLimparColunaEspecifica,
    aoAlternarOrdenacao,
    aoClicarEditar,
    aoClicarExcluir,
}) => {
    const [dropdownAberto, setDropdownAberto] =
        useState<TColunaFiltroArtista | null>(null)
    const cabecalhoTabelaRef = useRef<HTMLTableSectionElement>(null)

    useEffect(() => {
        const manipularCliqueFora = (evento: MouseEvent) => {
            if (
                cabecalhoTabelaRef.current &&
                !cabecalhoTabelaRef.current.contains(evento.target as Node)
            ) {
                setDropdownAberto(null)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const alternarDropdownColuna = (coluna: TColunaFiltroArtista) => {
        setDropdownAberto((atual) => (atual === coluna ? null : coluna))
    }

    const alternarItemSelecionado = (
        campo:
            | 'nomesArtistasSelecionados'
            | 'nomesSociaisSelecionados'
            | 'emailsSelecionados'
            | 'telefonesSelecionados'
            | 'quantidadesEventosSelecionadas',
        valor: string
    ) => {
        const listaAtual = filtrosColuna[campo]
        const jaExiste = listaAtual.includes(valor)
        const novaLista = jaExiste
            ? listaAtual.filter((item) => item !== valor)
            : [...listaAtual, valor]
        aoAlterarFiltroColuna(campo, novaLista)
    }

    const renderizarIconeOrdenacao = (coluna: TColunaOrdenavelArtista) => {
        const estaAtiva = ordenacaoAtual.colunaAtiva === coluna
        if (!estaAtiva) {
            return <ArrowUpDown className="w-3 h-3 text-white/75" />
        }
        return ordenacaoAtual.direcao === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-white" />
        ) : (
            <ArrowDown className="w-3 h-3 text-white" />
        )
    }

    const colunaPossuiFiltroAtivo = (coluna: TColunaFiltroArtista): boolean => {
        switch (coluna) {
            case 'nome_artista':
                return (
                    filtrosColuna.textoNomeArtista.trim() !== '' ||
                    filtrosColuna.nomesArtistasSelecionados.length > 0
                )
            case 'nome_social':
                return (
                    filtrosColuna.textoNomeSocial.trim() !== '' ||
                    filtrosColuna.nomesSociaisSelecionados.length > 0
                )
            case 'email':
                return (
                    filtrosColuna.textoEmail.trim() !== '' ||
                    filtrosColuna.emailsSelecionados.length > 0
                )
            case 'telefone':
                return (
                    filtrosColuna.textoTelefoneNumeros.trim() !== '' ||
                    filtrosColuna.telefonesSelecionados.length > 0
                )
            case 'quantidade_eventos':
                return (
                    filtrosColuna.textoQuantidadeEventos.trim() !== '' ||
                    filtrosColuna.quantidadesEventosSelecionadas.length > 0
                )
        }
    }

    const opcoesNomeArtistaVisiveis = opcoesColunas.nomesArtistas.filter((nome) =>
        nome
            .toLowerCase()
            .includes(filtrosColuna.textoNomeArtista.trim().toLowerCase())
    )

    const opcoesNomeSocialVisiveis = opcoesColunas.nomesSociais.filter((sigla) =>
        sigla
            .toLowerCase()
            .includes(filtrosColuna.textoNomeSocial.trim().toLowerCase())
    )

    const opcoesEmailVisiveis = opcoesColunas.emails.filter((email) =>
        email.toLowerCase().includes(filtrosColuna.textoEmail.trim().toLowerCase())
    )

    const opcoesTelefoneVisiveis = opcoesColunas.telefones.filter((tel) => {
        const digitosBusca = filtrosColuna.textoTelefoneNumeros.trim()
        if (!digitosBusca) return true
        return extrairApenasNumeros(tel).includes(digitosBusca)
    })

    const opcoesQtdEventosVisiveis = opcoesColunas.quantidadesEventos.filter(
        (qtd) => {
            const buscaQtd = filtrosColuna.textoQuantidadeEventos.trim()
            if (!buscaQtd) return true
            return qtd.includes(buscaQtd)
        }
    )

    return (
        <ContainerGridPadrao larguraMinimaPx="min-w-[780px]">
            <div className={ESTILOS_PADRAO_GRID.viewportAlturaFixa}>
                <table className="w-full text-left border-collapse">
                    <thead
                        ref={cabecalhoTabelaRef}
                        className={ESTILOS_PADRAO_GRID.cabecalhoColunasAzul}
                    >
                        <tr>
                            <th className="relative py-1 px-2.5">
                                <div className="flex items-center justify-between gap-1">
                                    <button
                                        type="button"
                                        onClick={() => aoAlternarOrdenacao('nome_artista')}
                                        title="Ordenar por Nome do Artista"
                                        className="inline-flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer hover:underline"
                                    >
                                        <span>Nome Artista</span>
                                        {renderizarIconeOrdenacao('nome_artista')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => alternarDropdownColuna('nome_artista')}
                                        title="Filtrar Nome do Artista"
                                        className={obterClasseBotaoColunaAzul(
                                            colunaPossuiFiltroAtivo('nome_artista')
                                        )}
                                    >
                                        <Filter className="w-2.5 h-2.5" />
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>

                                {dropdownAberto === 'nome_artista' && (
                                    <div className="absolute left-0 top-8 z-40 w-60 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Filtrar Nome Artista
                                            </span>
                                            {colunaPossuiFiltroAtivo('nome_artista') && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoLimparColunaEspecifica('nome_artista')
                                                    }
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Digitar nome do artista..."
                                                value={filtrosColuna.textoNomeArtista}
                                                onChange={(e) =>
                                                    aoAlterarFiltroColuna(
                                                        'textoNomeArtista',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                            {opcoesNomeArtistaVisiveis.length === 0 ? (
                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                    Nenhum nome correspondente
                                                </p>
                                            ) : (
                                                opcoesNomeArtistaVisiveis.map((nome) => {
                                                    const marcado =
                                                        filtrosColuna.nomesArtistasSelecionados.includes(
                                                            nome
                                                        )
                                                    return (
                                                        <button
                                                            key={nome}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemSelecionado(
                                                                    'nomesArtistasSelecionados',
                                                                    nome
                                                                )
                                                            }
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
                                                            <span className="truncate">{nome}</span>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </th>

                            <th className="relative py-1 px-2.5 w-36">
                                <div className="flex items-center justify-between gap-1">
                                    <button
                                        type="button"
                                        onClick={() => aoAlternarOrdenacao('nome_social')}
                                        title="Ordenar por Nome Social"
                                        className="inline-flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer hover:underline"
                                    >
                                        <span>Nome Social</span>
                                        {renderizarIconeOrdenacao('nome_social')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => alternarDropdownColuna('nome_social')}
                                        title="Filtrar Nome Social"
                                        className={obterClasseBotaoColunaAzul(
                                            colunaPossuiFiltroAtivo('nome_social')
                                        )}
                                    >
                                        <Filter className="w-2.5 h-2.5" />
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>

                                {dropdownAberto === 'nome_social' && (
                                    <div className="absolute left-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Filtrar Nome Social
                                            </span>
                                            {colunaPossuiFiltroAtivo('nome_social') && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoLimparColunaEspecifica('nome_social')
                                                    }
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Digitar sigla (Ex: C&R)..."
                                                value={filtrosColuna.textoNomeSocial}
                                                onChange={(e) =>
                                                    aoAlterarFiltroColuna(
                                                        'textoNomeSocial',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                            {opcoesNomeSocialVisiveis.length === 0 ? (
                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                    Nenhuma sigla encontrada
                                                </p>
                                            ) : (
                                                opcoesNomeSocialVisiveis.map((sigla) => {
                                                    const marcado =
                                                        filtrosColuna.nomesSociaisSelecionados.includes(
                                                            sigla
                                                        )
                                                    return (
                                                        <button
                                                            key={sigla}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemSelecionado(
                                                                    'nomesSociaisSelecionados',
                                                                    sigla
                                                                )
                                                            }
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
                                                            <span className="truncate">{sigla}</span>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </th>

                            <th className="relative py-1 px-2.5">
                                <button
                                    type="button"
                                    onClick={() => alternarDropdownColuna('email')}
                                    className={obterClasseBotaoColunaAzul(
                                        colunaPossuiFiltroAtivo('email')
                                    )}
                                >
                                    <span>E-mail</span>
                                    <Filter className="w-2.5 h-2.5 opacity-80" />
                                    <ChevronDown className="w-3 h-3 opacity-80" />
                                </button>

                                {dropdownAberto === 'email' && (
                                    <div className="absolute left-0 top-8 z-40 w-64 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Filtrar E-mail
                                            </span>
                                            {colunaPossuiFiltroAtivo('email') && (
                                                <button
                                                    type="button"
                                                    onClick={() => aoLimparColunaEspecifica('email')}
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Digitar e-mail..."
                                                value={filtrosColuna.textoEmail}
                                                onChange={(e) =>
                                                    aoAlterarFiltroColuna('textoEmail', e.target.value)
                                                }
                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                            {opcoesEmailVisiveis.length === 0 ? (
                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                    Nenhum e-mail encontrado
                                                </p>
                                            ) : (
                                                opcoesEmailVisiveis.map((emailItem) => {
                                                    const marcado =
                                                        filtrosColuna.emailsSelecionados.includes(emailItem)
                                                    return (
                                                        <button
                                                            key={emailItem}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemSelecionado(
                                                                    'emailsSelecionados',
                                                                    emailItem
                                                                )
                                                            }
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
                                                            <span className="truncate">{emailItem}</span>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </th>

                            <th className="relative py-1 px-2.5 w-44">
                                <button
                                    type="button"
                                    onClick={() => alternarDropdownColuna('telefone')}
                                    className={obterClasseBotaoColunaAzul(
                                        colunaPossuiFiltroAtivo('telefone')
                                    )}
                                >
                                    <span>Telefone</span>
                                    <Filter className="w-2.5 h-2.5 opacity-80" />
                                    <ChevronDown className="w-3 h-3 opacity-80" />
                                </button>

                                {dropdownAberto === 'telefone' && (
                                    <div className="absolute left-0 top-8 z-40 w-60 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Filtrar Telefone (Números)
                                            </span>
                                            {colunaPossuiFiltroAtivo('telefone') && (
                                                <button
                                                    type="button"
                                                    onClick={() => aoLimparColunaEspecifica('telefone')}
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Apenas números (Ex: 6299812)..."
                                                value={filtrosColuna.textoTelefoneNumeros}
                                                onChange={(e) =>
                                                    aoAlterarFiltroColuna(
                                                        'textoTelefoneNumeros',
                                                        extrairApenasNumeros(e.target.value)
                                                    )
                                                }
                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                            {opcoesTelefoneVisiveis.length === 0 ? (
                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                    Nenhum telefone encontrado
                                                </p>
                                            ) : (
                                                opcoesTelefoneVisiveis.map((telItem) => {
                                                    const marcado =
                                                        filtrosColuna.telefonesSelecionados.includes(
                                                            telItem
                                                        )
                                                    return (
                                                        <button
                                                            key={telItem}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemSelecionado(
                                                                    'telefonesSelecionados',
                                                                    telItem
                                                                )
                                                            }
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
                                                            <span className="truncate">{telItem}</span>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </th>
                            <th className="relative py-1 px-2.5 text-center w-36">
                                <button
                                    type="button"
                                    onClick={() => alternarDropdownColuna('quantidade_eventos')}
                                    className={obterClasseBotaoColunaAzul(
                                        colunaPossuiFiltroAtivo('quantidade_eventos')
                                    )}
                                >
                                    <span>Qtd. Eventos</span>
                                    <Filter className="w-2.5 h-2.5 opacity-80" />
                                    <ChevronDown className="w-3 h-3 opacity-80" />
                                </button>

                                {dropdownAberto === 'quantidade_eventos' && (
                                    <div className="absolute right-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 text-left font-normal normal-case tracking-normal space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Filtrar Qtd. Eventos
                                            </span>
                                            {colunaPossuiFiltroAtivo('quantidade_eventos') && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoLimparColunaEspecifica('quantidade_eventos')
                                                    }
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Digitar quantidade (Ex: 14)..."
                                                value={filtrosColuna.textoQuantidadeEventos}
                                                onChange={(e) =>
                                                    aoAlterarFiltroColuna(
                                                        'textoQuantidadeEventos',
                                                        extrairApenasNumeros(e.target.value)
                                                    )
                                                }
                                                className="w-full h-7 rounded-md border border-slate-300 bg-slate-50 pl-7 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="max-h-44 overflow-y-auto space-y-0.5 pt-0.5">
                                            {opcoesQtdEventosVisiveis.length === 0 ? (
                                                <p className="text-[10.5px] text-slate-400 text-center py-2">
                                                    Nenhuma quantidade encontrada
                                                </p>
                                            ) : (
                                                opcoesQtdEventosVisiveis.map((qtdStr) => {
                                                    const marcado =
                                                        filtrosColuna.quantidadesEventosSelecionadas.includes(
                                                            qtdStr
                                                        )
                                                    return (
                                                        <button
                                                            key={qtdStr}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemSelecionado(
                                                                    'quantidadesEventosSelecionadas',
                                                                    qtdStr
                                                                )
                                                            }
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
                                                            <span>{qtdStr} evento(s)</span>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </th>

                            <th className="py-1 px-2.5 text-center w-24 print:hidden">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200/80 text-[10.5px] leading-tight text-slate-600">
                        {listaArtistas.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="py-12 px-4 text-center text-[11px] text-slate-400"
                                >
                                    Nenhum artista ou apresentador encontrado para os filtros aplicados.
                                </td>
                            </tr>
                        ) : (
                            listaArtistas.map((artista) => (
                                <tr
                                    key={artista.id}
                                    className="hover:bg-blue-50/35 transition-colors"
                                >
                                    <td className="py-1.5 px-2.5 font-semibold text-slate-800">
                                        {artista.nome_artista}
                                    </td>

                                    <td className="py-1.5 px-2.5">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                            {artista.nome_social}
                                        </span>
                                    </td>

                                    <td className="py-1.5 px-2.5 text-slate-600">
                                        {artista.email ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-slate-400 shrink-0 print:hidden" />
                                                <span className="truncate max-w-[210px]">
                                                    {artista.email}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-1.5 px-2.5 text-slate-600">
                                        {artista.telefone ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400 shrink-0 print:hidden" />
                                                <span>{artista.telefone}</span>
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-1.5 px-2.5 text-center">
                                        <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                                            <Calendar className="w-2.5 h-2.5 text-[#1056f5] print:hidden" />
                                            {artista.quantidade_eventos}
                                        </span>
                                    </td>

                                    <td className="py-1.5 px-2.5 text-center print:hidden">
                                        <div className="inline-flex items-center justify-center gap-1">
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => aoClicarEditar(artista)}
                                                    title="Editar informações"
                                                    aria-label="Editar informações"
                                                    className="p-1 rounded-md text-slate-500 hover:text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                    Editar informações
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => aoClicarExcluir(artista)}
                                                    title="Deletar Artista/Apresentador"
                                                    aria-label="Deletar Artista/Apresentador"
                                                    className="p-1 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                    Deletar Artista/Apresentador
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </ContainerGridPadrao>
    )
}
