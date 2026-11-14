import React, { useState } from 'react'
import { X, Receipt, Plus, Trash2 } from 'lucide-react'
import {
    formatarMoedaBRL,
    converterTextoParaValorMonetario,
    type IResumoCalculadoFinanceiroEvento,
} from '@/types/financeiro.types'

interface IModalDespesasEventoProps {
    registroEvento: IResumoCalculadoFinanceiroEvento | null
    aoFechar: () => void
    aoAdicionarDespesa: (
        eventoId: number,
        nova: { data_despesa: string; valor: number; justificativa: string }
    ) => void
    aoExcluirDespesa: (eventoId: number, despesaId: number) => void
}

export const ModalDespesasEvento: React.FC<IModalDespesasEventoProps> = ({
    registroEvento,
    aoFechar,
    aoAdicionarDespesa,
    aoExcluirDespesa,
}) => {
    const [dataDespesa, setDataDespesa] = useState<string>(
        registroEvento?.data_evento || '2026-10-24'
    )
    const [valorTexto, setValorTexto] = useState<string>('')
    const [justificativa, setJustificativa] = useState<string>('')

    if (!registroEvento) return null

    const manipularAdicionar = (e: React.FormEvent) => {
        e.preventDefault()
        const valorNumerico = converterTextoParaValorMonetario(valorTexto)
        if (!dataDespesa || valorNumerico <= 0 || !justificativa.trim()) return

        aoAdicionarDespesa(registroEvento.evento_id, {
            data_despesa: dataDespesa,
            valor: valorNumerico,
            justificativa: justificativa.trim(),
        })

        setValorTexto('')
        setJustificativa('')
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
                onClick={aoFechar}
            />

            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Cabeçalho da Modal de Despesa */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Despesas do Evento — {registroEvento.cidade_uf} (
                                {registroEvento.artista})
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Histórico de custos, datas e justificativas financeiras
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        title="Fechar "
                        className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Formulário Rápido para Nova Despesa */}
                <form
                    onSubmit={manipularAdicionar}
                    className="p-4 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                >
                    <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Data
                        </label>
                        <input
                            type="date"
                            value={dataDespesa}
                            onChange={(e) => setDataDespesa(e.target.value)}
                            className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:border-[#1056f5] focus:outline-none"
                            required
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Valor (R$)
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: 3500 ou 3,5K"
                            value={valorTexto}
                            onChange={(e) => setValorTexto(e.target.value)}
                            className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none"
                            required
                        />
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Justificativa
                        </label>
                        <input
                            type="text"
                            placeholder="Descreva a despesa..."
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none"
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full h-8 inline-flex items-center justify-center gap-1 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-3 text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Lançar</span>
                        </button>
                    </div>
                </form>

                {/* Tabela de Despesas com Cabeçalho Azul (Data | Valor | Justificativa) */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1056f5] text-white text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-2 px-3 text-center w-28">Data</th>
                                    <th className="py-2 px-3 text-right w-36">Valor</th>
                                    <th className="py-2 px-4">Justificativa</th>
                                    <th className="py-2 px-3 text-center w-16">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                {registroEvento.despesas.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-8 px-4 text-center text-xs text-slate-400"
                                        >
                                            Nenhuma despesa cadastrada para este evento.
                                        </td>
                                    </tr>
                                ) : (
                                    registroEvento.despesas.map((desp) => (
                                        <tr
                                            key={desp.id}
                                            className="hover:bg-blue-50/35 transition-colors"
                                        >
                                            <td className="py-2 px-3 text-center font-medium text-slate-600">
                                                {desp.data_despesa.split('-').reverse().join('/')}
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold text-red-600">
                                                {formatarMoedaBRL(desp.valor)}
                                            </td>
                                            <td className="py-2 px-4 text-slate-700">
                                                {desp.justificativa}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoExcluirDespesa(registroEvento.evento_id, desp.id)
                                                    }
                                                    title="Excluir despesa"
                                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rodapé Totalizador de Despesas */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                        Total de lançamentos: <strong>{registroEvento.despesas.length}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Despesa Total:</span>
                        <span className="text-sm font-extrabold text-red-600">
                            {formatarMoedaBRL(registroEvento.despesaTotal)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
