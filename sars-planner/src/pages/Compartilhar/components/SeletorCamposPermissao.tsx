import React, { useState } from 'react'
import {
    ChevronDown,
    ChevronRight,
    ArrowRight,
    X,
    CheckSquare,
    RotateCcw,
    Layers,
    Calculator,
} from 'lucide-react'
import {
    CATALOGO_CAMPOS_COMPARTILHAR,
    ROTULOS_CATEGORIAS_COMPARTILHAR,
    type IDefinicaoCampoCompartilhar,
    type TCategoriaCampoCompartilhar,
    type TIdCampoCompartilhar,
} from '@/types/compartilhar.types'

const ORDEM_CATEGORIAS: TCategoriaCampoCompartilhar[] = [
    'EVENTO',
    'FINANCEIRO',
    'ARTISTA',
]

interface ISeletorCamposPermissaoProps {
    camposSelecionados: TIdCampoCompartilhar[]
    aoAlternarCampo: (idCampo: TIdCampoCompartilhar) => void
    aoSelecionarCategoriaInteira: (categoria: TCategoriaCampoCompartilhar) => void
    aoRemoverCategoriaInteira: (categoria: TCategoriaCampoCompartilhar) => void
    aoRestaurarPadrao: () => void
}

export const SeletorCamposPermissao: React.FC<ISeletorCamposPermissaoProps> = ({
    camposSelecionados,
    aoAlternarCampo,
    aoSelecionarCategoriaInteira,
    aoRemoverCategoriaInteira,
    aoRestaurarPadrao,
}) => {
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

    return (
        <section className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.03)] space-y-3 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                            Selecionar colunas para Exibir
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={aoRestaurarPadrao}
                    className="h-7 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 text-[10.5px] font-semibold text-slate-600 cursor-pointer"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar Colunas Padrão</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40">
                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500">
                            Clique para habilitar →
                        </span>
                    </div>

                    <div className="divide-y divide-slate-200 max-h-68 overflow-y-auto">
                        {ORDEM_CATEGORIAS.map((cat) => {
                            const todosDaCategoria = obterCamposDaCategoria(cat)
                            const disponiveisNaoSelecionados = todosDaCategoria.filter(
                                (c) => !camposSelecionados.includes(c.id)
                            )
                            const aberto = gruposEsquerdaAbertos[cat]

                            return (
                                <div key={`disp-${cat}`} className="bg-white">
                                    <div className="px-3 py-1.5 bg-slate-100/70 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => alternarGrupoEsquerda(cat)}
                                            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 cursor-pointer"
                                        >
                                            {aberto ? (
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
                                                onClick={() => aoSelecionarCategoriaInteira(cat)}
                                                className="text-[10px] font-bold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                + Selecionar todos
                                            </button>
                                        )}
                                    </div>

                                    {aberto && (
                                        <div className="p-2 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {disponiveisNaoSelecionados.length === 0 ? (
                                                <p className="col-span-2 text-[10.5px] text-emerald-600 font-semibold py-1">
                                                    ✓ Todos os campos de{' '}
                                                    {ROTULOS_CATEGORIAS_COMPARTILHAR[cat]} já estão
                                                    selecionados ao lado.
                                                </p>
                                            ) : (
                                                disponiveisNaoSelecionados.map((campo) => (
                                                    <button
                                                        key={campo.id}
                                                        type="button"
                                                        onClick={() => aoAlternarCampo(campo.id)}
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
                                {camposSelecionados.length}
                            </span>
                        </div>
                        <span className="text-[10px] text-blue-100">
                            Clique em um campo para remover
                        </span>
                    </div>

                    <div className="divide-y divide-blue-100 max-h-68 overflow-y-auto">
                        {ORDEM_CATEGORIAS.map((cat) => {
                            const selecionadosDaCategoria = obterCamposDaCategoria(cat).filter(
                                (c) => camposSelecionados.includes(c.id)
                            )
                            const aberto = gruposDireitaAbertos[cat]

                            return (
                                <div key={`sel-${cat}`} className="bg-white">
                                    <div className="px-3 py-1.5 bg-blue-50/70 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => alternarGrupoDireita(cat)}
                                            className="flex items-center gap-1.5 text-xs font-extrabold text-[#1e2f8f] cursor-pointer"
                                        >
                                            {aberto ? (
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
                                                onClick={() => aoRemoverCategoriaInteira(cat)}
                                                className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                                            >
                                                Remover grupo
                                            </button>
                                        )}
                                    </div>

                                    {aberto && (
                                        <div className="p-2 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {selecionadosDaCategoria.length === 0 ? (
                                                <p className="col-span-2 text-[10.5px] text-slate-400 italic py-1">
                                                    Nenhum campo de {ROTULOS_CATEGORIAS_COMPARTILHAR[cat]}{' '}
                                                    selecionado.
                                                </p>
                                            ) : (
                                                selecionadosDaCategoria.map((campo) => (
                                                    <button
                                                        key={campo.id}
                                                        type="button"
                                                        onClick={() => aoAlternarCampo(campo.id)}
                                                        title="Clique para remover esta coluna da grid"
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
        </section>
    )
}
