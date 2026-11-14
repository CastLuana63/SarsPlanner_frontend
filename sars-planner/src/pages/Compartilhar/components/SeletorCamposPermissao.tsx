import React, { useState, useEffect } from 'react'
import {
    ChevronDown,
    ChevronRight,
    ArrowRight,
    X,
    CheckSquare,
    RotateCcw,
    Layers,
    Calculator,
    BookmarkCheck,
    Trash2,
    Filter,
    Save,
} from 'lucide-react'
import {
    CATALOGO_CAMPOS_COMPARTILHAR,
    CAMPOS_SELECIONADOS_PADRAO,
    ROTULOS_CATEGORIAS_COMPARTILHAR,
    type IDefinicaoCampoCompartilhar,
    type IFiltroColunasSalvo,
    type TCategoriaCampoCompartilhar,
    type TIdCampoCompartilhar,
} from '@/types/compartilhar.types'

const ORDEM_CATEGORIAS: TCategoriaCampoCompartilhar[] = [
    'EVENTO',
    'FINANCEIRO',
    'ARTISTA',
]

interface ISeletorCamposPermissaoProps {
    aberto: boolean
    camposAtuaisNaGrid: TIdCampoCompartilhar[]
    filtrosSalvos: IFiltroColunasSalvo[]
    filtroSalvoAtivoId: string | null
    aoFecharCancelar: () => void
    aoFiltrarColunasSemSalvar: (colunasEscolhidas: TIdCampoCompartilhar[]) => void
    aoSalvarNovoFiltro: (
        nomeFiltro: string,
        colunasEscolhidas: TIdCampoCompartilhar[]
    ) => void
    aoSelecionarFiltroSalvo: (filtroSalvo: IFiltroColunasSalvo) => void
    aoExcluirFiltroSalvo: (idFiltroSalvo: string) => void
}

export const SeletorCamposPermissao: React.FC<ISeletorCamposPermissaoProps> = ({
    aberto,
    camposAtuaisNaGrid,
    filtrosSalvos,
    filtroSalvoAtivoId,
    aoFecharCancelar,
    aoFiltrarColunasSemSalvar,
    aoSalvarNovoFiltro,
    aoSelecionarFiltroSalvo,
    aoExcluirFiltroSalvo,
}) => {
    const [rascunhoCampos, setRascunhoCampos] =
        useState<TIdCampoCompartilhar[]>(camposAtuaisNaGrid)
    const [nomeNovoFiltro, setNomeNovoFiltro] = useState<string>('')
    const [erroNomeFiltro, setErroNomeFiltro] = useState<string>('')

    const [gruposEsquerdaAbertos, setGruposEsquerdaAbertos] = useState<
        Record<TCategoriaCampoCompartilhar, boolean>
    >({
        EVENTO: true,
        FINANCEIRO: true,
        ARTISTA: true,
    })

    const [gruposDireitaAbertos, setGruposDireitaAbertos] = useState<
        Record<TCategoriaCampoCompartilhar, boolean>
    >({
        EVENTO: true,
        FINANCEIRO: true,
        ARTISTA: true,
    })

    useEffect(() => {
        if (aberto) {
            setRascunhoCampos(camposAtuaisNaGrid)
            setErroNomeFiltro('')
        }
    }, [aberto, camposAtuaisNaGrid])

    if (!aberto) return null

    const alternarGrupoEsquerda = (cat: TCategoriaCampoCompartilhar) => {
        setGruposEsquerdaAbertos((ant) => ({ ...ant, [cat]: !ant[cat] }))
    }

    const alternarGrupoDireita = (cat: TCategoriaCampoCompartilhar) => {
        setGruposDireitaAbertos((ant) => ({ ...ant, [cat]: !ant[cat] }))
    }

    const obterCamposDaCategoria = (
        cat: TCategoriaCampoCompartilhar
    ): IDefinicaoCampoCompartilhar[] => {
        return CATALOGO_CAMPOS_COMPARTILHAR.filter((c) => c.categoria === cat)
    }

    const alternarCampoNoRascunho = (idCampo: TIdCampoCompartilhar) => {
        setRascunhoCampos((ant) =>
            ant.includes(idCampo)
                ? ant.filter((id) => id !== idCampo)
                : [...ant, idCampo]
        )
    }

    const selecionarCategoriaInteiraNoRascunho = (
        cat: TCategoriaCampoCompartilhar
    ) => {
        const idsDaCategoria = obterCamposDaCategoria(cat).map((c) => c.id)
        setRascunhoCampos((ant) => Array.from(new Set([...ant, ...idsDaCategoria])))
    }

    const removerCategoriaInteiraNoRascunho = (
        cat: TCategoriaCampoCompartilhar
    ) => {
        const idsDaCategoria = new Set(obterCamposDaCategoria(cat).map((c) => c.id))
        setRascunhoCampos((ant) => ant.filter((id) => !idsDaCategoria.has(id)))
    }

    const manipularCliqueFiltrarColunas = () => {
        if (rascunhoCampos.length === 0) {
            setErroNomeFiltro('Selecione pelo menos 1 coluna para exibir na tabela.')
            return
        }
        aoFiltrarColunasSemSalvar(rascunhoCampos)
    }

    const manipularCliqueSalvarFiltro = () => {
        if (rascunhoCampos.length === 0) {
            setErroNomeFiltro('Selecione pelo menos 1 coluna antes de salvar.')
            return
        }
        if (!nomeNovoFiltro.trim()) {
            setErroNomeFiltro('Digite um nome no campo ao lado para salvar o filtro.')
            return
        }
        aoSalvarNovoFiltro(nomeNovoFiltro.trim(), rascunhoCampos)
        setNomeNovoFiltro('')
        setErroNomeFiltro('')
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/15 backdrop-blur-[1.5px] transition-opacity"
                onClick={aoFecharCancelar}
            />

            <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Editar Colunas e Filtros Salvos
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Selecione um filtro salvo ou personalize as colunas de Evento,
                                Financeiro e Artistas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setRascunhoCampos(CAMPOS_SELECIONADOS_PADRAO)}
                            className="h-7 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-2.5 text-[10.5px] font-semibold text-slate-600 cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restaurar Padrão</span>
                        </button>

                        <button
                            type="button"
                            onClick={aoFecharCancelar}
                            title="Fechar modal"
                            className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="px-5 py-2.5 bg-blue-50/35 border-b border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 mr-1">
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#1056f5]" />
                        <span>Filtros Salvos:</span>
                    </span>

                    {filtrosSalvos.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                            Nenhum filtro salvo no momento.
                        </span>
                    ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {filtrosSalvos.map((filtroSalvo) => {
                                const estaAtivo = filtroSalvo.id === filtroSalvoAtivoId
                                return (
                                    <div
                                        key={filtroSalvo.id}
                                        className={`inline-flex items-center rounded-lg border text-[11px] transition ${estaAtivo
                                                ? 'bg-[#1056f5] text-white border-[#1056f5] font-bold shadow-2xs'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#1056f5]'
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRascunhoCampos(filtroSalvo.colunas)
                                                aoSelecionarFiltroSalvo(filtroSalvo)
                                            }}
                                            className="px-2.5 py-1 cursor-pointer flex items-center gap-1"
                                        >
                                            <span>{filtroSalvo.nome}</span>
                                            <span
                                                className={`text-[9.5px] px-1 rounded ${estaAtivo
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {filtroSalvo.colunas.length}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => aoExcluirFiltroSalvo(filtroSalvo.id)}
                                            title={`Apagar filtro "${filtroSalvo.nome}"`}
                                            className={`px-1.5 py-1 border-l transition cursor-pointer ${estaAtivo
                                                    ? 'border-blue-400 text-blue-100 hover:text-white hover:bg-blue-700 rounded-r-lg'
                                                    : 'border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-r-lg'
                                                }`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40">
                            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                    1. Campos Não Selecionados
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                    Clique para adicionar →
                                </span>
                            </div>

                            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                                {ORDEM_CATEGORIAS.map((cat) => {
                                    const todosDaCategoria = obterCamposDaCategoria(cat)
                                    const disponiveisNaoSelecionados = todosDaCategoria.filter(
                                        (c) => !rascunhoCampos.includes(c.id)
                                    )
                                    const abertoGrupo = gruposEsquerdaAbertos[cat]

                                    return (
                                        <div key={`disp-${cat}`} className="bg-white">
                                            <div className="px-3 py-1.5 bg-slate-100/70 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => alternarGrupoEsquerda(cat)}
                                                    className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 cursor-pointer"
                                                >
                                                    {abertoGrupo ? (
                                                        <ChevronDown className="w-3.5 h-3.5 text-[#1056f5]" />
                                                    ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                                    )}
                                                    <span>{ROTULOS_CATEGORIAS_COMPARTILHAR[cat]}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        ({disponiveisNaoSelecionados.length} disponíveis)
                                                    </span>
                                                </button>

                                                {disponiveisNaoSelecionados.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            selecionarCategoriaInteiraNoRascunho(cat)
                                                        }
                                                        className="text-[10px] font-bold text-[#1056f5] hover:underline cursor-pointer"
                                                    >
                                                        + Selecionar todos
                                                    </button>
                                                )}
                                            </div>

                                            {abertoGrupo && (
                                                <div className="p-2 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {disponiveisNaoSelecionados.length === 0 ? (
                                                        <p className="col-span-2 text-[10.5px] text-emerald-600 font-semibold py-1">
                                                            ✓ Todos os campos de{' '}
                                                            {ROTULOS_CATEGORIAS_COMPARTILHAR[cat]} estão
                                                            selecionados.
                                                        </p>
                                                    ) : (
                                                        disponiveisNaoSelecionados.map((campo) => (
                                                            <button
                                                                key={campo.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    alternarCampoNoRascunho(campo.id)
                                                                }
                                                                title={campo.descricao}
                                                                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-[#1056f5] px-2.5 py-1.5 text-left transition cursor-pointer"
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#1056f5] block truncate">
                                                                        {campo.rotulo}
                                                                    </span>
                                                                    {(campo.tipoValor === 'moeda' ||
                                                                        campo.tipoValor === 'numero') && (
                                                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-400">
                                                                                <Calculator className="w-2.5 h-2.5" />
                                                                                Soma total na coluna
                                                                            </span>
                                                                        )}
                                                                </div>
                                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1056f5] group-hover:translate-x-0.5 transition-transform shrink-0" />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl border-2 border-[#1056f5]/40 overflow-hidden bg-blue-50/20">
                            <div className="px-3 py-2 bg-[#1056f5] text-white flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        2. Campos Selecionados ({rascunhoCampos.length})
                                    </span>
                                </div>
                                <span className="text-[10px] text-blue-100">
                                    Clique para remover
                                </span>
                            </div>

                            <div className="divide-y divide-blue-100 max-h-80 overflow-y-auto">
                                {ORDEM_CATEGORIAS.map((cat) => {
                                    const selecionadosDaCategoria = obterCamposDaCategoria(
                                        cat
                                    ).filter((c) => rascunhoCampos.includes(c.id))
                                    const abertoGrupo = gruposDireitaAbertos[cat]

                                    return (
                                        <div key={`sel-${cat}`} className="bg-white">
                                            <div className="px-3 py-1.5 bg-blue-50/70 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => alternarGrupoDireita(cat)}
                                                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#1e2f8f] cursor-pointer"
                                                >
                                                    {abertoGrupo ? (
                                                        <ChevronDown className="w-3.5 h-3.5 text-[#1056f5]" />
                                                    ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 text-[#1056f5]" />
                                                    )}
                                                    <span>{ROTULOS_CATEGORIAS_COMPARTILHAR[cat]}</span>
                                                    <span className="px-1.5 py-0.2 rounded-full bg-[#1056f5] text-white text-[9.5px] font-extrabold">
                                                        {selecionadosDaCategoria.length}
                                                    </span>
                                                </button>

                                                {selecionadosDaCategoria.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removerCategoriaInteiraNoRascunho(cat)
                                                        }
                                                        className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                                                    >
                                                        Remover grupo
                                                    </button>
                                                )}
                                            </div>

                                            {abertoGrupo && (
                                                <div className="p-2 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {selecionadosDaCategoria.length === 0 ? (
                                                        <p className="col-span-2 text-[10.5px] text-slate-400 italic py-1">
                                                            Nenhum campo de{' '}
                                                            {ROTULOS_CATEGORIAS_COMPARTILHAR[cat]}{' '}
                                                            selecionado.
                                                        </p>
                                                    ) : (
                                                        selecionadosDaCategoria.map((campo) => (
                                                            <button
                                                                key={campo.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    alternarCampoNoRascunho(campo.id)
                                                                }
                                                                title="Clique para remover esta coluna"
                                                                className="group flex items-center justify-between gap-2 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-2.5 py-1.5 text-left shadow-2xs transition cursor-pointer"
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="text-[11px] font-bold block truncate">
                                                                        {campo.rotulo}
                                                                    </span>
                                                                    {(campo.tipoValor === 'moeda' ||
                                                                        campo.tipoValor === 'numero') && (
                                                                            <span className="text-[9px] text-blue-100 block">
                                                                                Σ Exibe total no topo da coluna
                                                                            </span>
                                                                        )}
                                                                </div>
                                                                <X className="w-3.5 h-3.5 text-blue-200 group-hover:text-white shrink-0" />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                        <input
                            type="text"
                            placeholder="Nome para salvar este filtro (Ex: Visão Contabilidade)..."
                            value={nomeNovoFiltro}
                            onChange={(e) => {
                                setNomeNovoFiltro(e.target.value)
                                if (erroNomeFiltro) setErroNomeFiltro('')
                            }}
                            className="w-full max-w-xs h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none"
                        />
                        {erroNomeFiltro && (
                            <span className="text-[11px] font-semibold text-red-600">
                                {erroNomeFiltro}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={aoFecharCancelar}
                            className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={manipularCliqueFiltrarColunas}
                            title="Aplica as colunas selecionadas na tabela sem precisar salvar como filtro"
                            className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filtrar Colunas</span>
                        </button>

                        <button
                            type="button"
                            onClick={manipularCliqueSalvarFiltro}
                            title="Salva a seleção atual com o nome informado e aplica na tabela"
                            className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>Salvar Filtros</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
