import React from 'react'
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Pencil,
    Trash2,
    Calendar,
    Mail,
    Phone,
} from 'lucide-react'
import type {
    IArtista,
    IConfiguracaoOrdenacaoArtista,
    TColunaOrdenavelArtista,
} from '@/types/artista.types'

interface ITabelaArtistasProps {
    listaArtistas: IArtista[]
    ordenacaoAtual: IConfiguracaoOrdenacaoArtista
    aoAlternarOrdenacao: (coluna: TColunaOrdenavelArtista) => void
    aoClicarEditar: (artista: IArtista) => void
    aoClicarExcluir: (artista: IArtista) => void
}

export const TabelaArtistas: React.FC<ITabelaArtistasProps> = ({
    listaArtistas,
    ordenacaoAtual,
    aoAlternarOrdenacao,
    aoClicarEditar,
    aoClicarExcluir,
}) => {
    const renderizarIconeOrdenacao = (coluna: TColunaOrdenavelArtista) => {
        const estaAtiva = ordenacaoAtual.colunaAtiva === coluna

        if (!estaAtiva) {
            return (
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )
        }

        return ordenacaoAtual.direcao === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#1056f5]" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#1056f5]" />
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                            <th className="py-3 px-4">
                                <button
                                    type="button"
                                    onClick={() => aoAlternarOrdenacao('nome_artista')}
                                    title="Ordenar por Nome do Artista"
                                    className={`group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer transition-colors ${ordenacaoAtual.colunaAtiva === 'nome_artista'
                                            ? 'text-[#1056f5]'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <span>Nome Artista</span>
                                    {renderizarIconeOrdenacao('nome_artista')}
                                </button>
                            </th>
                            <th className="py-3 px-4">
                                <button
                                    type="button"
                                    onClick={() => aoAlternarOrdenacao('nome_social')}
                                    title="Ordenar por Nome Social"
                                    className={`group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer transition-colors ${ordenacaoAtual.colunaAtiva === 'nome_social'
                                            ? 'text-[#1056f5]'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <span>Nome Social</span>
                                    {renderizarIconeOrdenacao('nome_social')}
                                </button>
                            </th>
                            <th className="py-3 px-4">E-mail</th>
                            <th className="py-3 px-4">Telefone</th>
                            <th className="py-3 px-4 text-center">Qtd. Eventos</th>
                            <th className="py-3 px-4 text-center w-28 print:hidden">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 text-xs sm:text-[13px] text-slate-700">
                        {listaArtistas.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="py-8 px-4 text-center text-xs text-slate-400"
                                >
                                    Nenhum artista ou apresentador cadastrado para o filtro atual.
                                </td>
                            </tr>
                        ) : (
                            listaArtistas.map((artista) => (
                                <tr
                                    key={artista.id}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="py-2.5 px-4 font-bold text-slate-900">
                                        {artista.nome_artista}
                                    </td>

                                    <td className="py-2.5 px-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#1056f5] border border-blue-200/70">
                                            {artista.nome_social}
                                        </span>
                                    </td>

                                    <td className="py-2.5 px-4 text-slate-600">
                                        {artista.email ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 print:hidden" />
                                                <span className="truncate max-w-[220px]">{artista.email}</span>
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-2.5 px-4 text-slate-600">
                                        {artista.telefone ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 print:hidden" />
                                                <span>{artista.telefone}</span>
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-2.5 px-4 text-center">
                                        <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                            <Calendar className="w-3 h-3 text-[#1056f5] print:hidden" />
                                            {artista.quantidade_eventos}
                                        </span>
                                    </td>

                                    <td className="py-2.5 px-4 text-center print:hidden">
                                        <div className="inline-flex items-center justify-center gap-1.5">
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => aoClicarEditar(artista)}
                                                    title="Editar informações"
                                                    aria-label="Editar informações"
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md z-30">
                                                    Editar informações
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => aoClicarExcluir(artista)}
                                                    title="Deletar Artista/Apresentador"
                                                    aria-label="Deletar Artista/Apresentador"
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md z-30">
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
        </div>
    )
}
