import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Plus,
    Trash2,
    Pencil,
    Check,
    Receipt,
    Percent,
    Sparkles,
    Printer,
    Calendar,
    CheckCircle2,
} from 'lucide-react'
import { useFinanceiro } from '@/contexts/FinanceiroContext'
import { ModalDespesasEvento } from './components/ModalDespesasEvento'
import {
    formatarMoedaBRL,
    converterTextoParaValorMonetario,
    type TStatusParcela,
} from '@/types/financeiro.types'

export const DetalheFinanceiroEventoPage: React.FC = () => {
    const { eventoId } = useParams<{ eventoId: string }>()
    const navigate = useNavigate()

    const {
        obterFinanceiroPorEventoId,
        atualizarDadosCompartilharEvento,
        adicionarParcela,
        gerarParcelasAutomaticas,
        atualizarParcela,
        excluirParcela,
        adicionarDespesa,
        excluirDespesa,
    } = useFinanceiro()

    const registro = obterFinanceiroPorEventoId(Number(eventoId))
    const [contatoInput, setContatoInput] = useState('')
    const [diariaValorInput, setDiariaValorInput] = useState('')
    const [custosInput, setCustosInput] = useState('')
    const [operacionalInput, setOperacionalInput] = useState('')
    const [descontoPctInput, setDescontoPctInput] = useState('0')
    const [numeroParcelaInput, setNumeroParcelaInput] = useState('')
    const [dataPagamentoInput, setDataPagamentoInput] = useState('')
    const [valorParcelaInput, setValorParcelaInput] = useState('')
    const [qtdAutoParcelas, setQtdAutoParcelas] = useState('4')
    const [valorTotalAutoInput, setValorTotalAutoInput] = useState('')
    const [mostrarGeradorAuto, setMostrarGeradorAuto] = useState(false)
    const [parcelaEditandoId, setParcelaEditandoId] = useState<number | null>(
        null
    )
    const [valorEditandoParcela, setValorEditandoParcela] = useState('')
    const [dataEditandoParcela, setDataEditandoParcela] = useState('')
    const [modalDespesasAberta, setModalDespesasAberta] = useState(false)
    const [feedbackSalvo, setFeedbackSalvo] = useState(false)

    useEffect(() => {
        if (!registro) return
        setContatoInput(registro.contato_nome_telefone)
        setDiariaValorInput(String(registro.diaria_valor || 0))
        setCustosInput(registro.producao_custos)
        setOperacionalInput(registro.producao_operacional)
        setDescontoPctInput(String(registro.desconto_percentual || 0))
        setNumeroParcelaInput(String(registro.parcelas.length + 1))
        setDataPagamentoInput(registro.data_evento)
    }, [registro])

    if (!registro) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3">
                <p className="text-xs text-slate-500">
                    Informações financeiras do evento não encontradas.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/financeira')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1056f5] text-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ir para Lista Financeira</span>
                </button>
            </div>
        )
    }

    const exibirFeedbackSalvo = () => {
        setFeedbackSalvo(true)
        setTimeout(() => setFeedbackSalvo(false), 1500)
    }

    const confirmarComEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur()
    }

    const manipularAdicionarParcela = (e: React.FormEvent) => {
        e.preventDefault()
        const valorNum = converterTextoParaValorMonetario(valorParcelaInput)
        if (!dataPagamentoInput || valorNum <= 0) return

        adicionarParcela(registro.evento_id, {
            numero_parcela:
                Number(numeroParcelaInput) || registro.parcelas.length + 1,
            data_pagamento: dataPagamentoInput,
            valor_bruto: valorNum,
            status: 'NAO_OK',
        })

        setValorParcelaInput('')
        setNumeroParcelaInput(String(registro.parcelas.length + 2))
        exibirFeedbackSalvo()
    }

    const manipularGerarParcelamento = (e: React.FormEvent) => {
        e.preventDefault()
        const qtd = Math.max(1, Math.min(36, Number(qtdAutoParcelas) || 1))
        const valorTotal = converterTextoParaValorMonetario(valorTotalAutoInput)
        if (valorTotal <= 0) return

        gerarParcelasAutomaticas(
            registro.evento_id,
            qtd,
            valorTotal,
            registro.data_evento
        )
        setMostrarGeradorAuto(false)
        setValorTotalAutoInput('')
        exibirFeedbackSalvo()
    }

    const fatorDesconto = 1 - (registro.desconto_percentual || 0) / 100

    return (
        <div className="space-y-3">
            <header className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.02)] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => navigate('/financeira')}
                        title="Voltar para a listagem financeira"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer print:hidden"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-sm sm:text-base font-bold text-slate-900">
                                Informações de Pagamento — {registro.cidade_uf}
                            </h1>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1056f5] border border-blue-200">
                                Artista: {registro.artista}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                Show: {registro.data_evento.split('-').reverse().join('/')}
                            </span>
                            {feedbackSalvo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Salvo
                                </span>
                            )}
                        </div>
                        <p className="text-[10.5px] text-slate-400">
                            Controle de compartilhamento, parcelamento, desconto opcional e
                            despesas do evento
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 print:hidden">
                    <button
                        type="button"
                        onClick={() => navigate(`/eventos/${registro.evento_id}`)}
                        className="h-7 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 text-[11px] font-semibold cursor-pointer"
                    >
                        <span>Ver Detalhes / Mapa do Evento</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setModalDespesasAberta(true)}
                        className="h-7 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 text-[11px] font-semibold cursor-pointer"
                    >
                        <Receipt className="w-3 h-3" />
                        <span>Modal de Despesas ({registro.despesas.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="h-7 inline-flex items-center gap-1 rounded-lg bg-[#2b4c7e] hover:bg-[#1e3a63] text-white px-2.5 text-[11px] font-semibold cursor-pointer"
                    >
                        <Printer className="w-3 h-3" />
                        <span>Imprimir PDF</span>
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Receita Total {registro.desconto_percentual > 0 ? `(c/ -${registro.desconto_percentual}%)` : ''}
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 block">
                        {formatarMoedaBRL(registro.receitaTotal)}
                    </strong>
                    {registro.desconto_percentual > 0 && (
                        <span className="text-[9.5px] text-amber-600 font-semibold">
                            Bruto: {formatarMoedaBRL(registro.receitaBrutaParcelas)} (Desc:{' '}
                            {formatarMoedaBRL(registro.valorDesconto)})
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-emerald-200 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Total Pago ({registro.quantidadeParcelasPagas}/
                        {registro.quantidadeParcelasTotal} parcelas)
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5 block">
                        {formatarMoedaBRL(registro.totalPago)}
                    </strong>
                    <span className="text-[9.5px] text-slate-400">
                        Parcelas com status OK
                    </span>
                </div>

                <div className="bg-white rounded-xl border border-amber-200 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                        Falta Pagar (Pendente)
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-amber-600 mt-0.5 block">
                        {formatarMoedaBRL(registro.totalFaltaPagar)}
                    </strong>
                    <span className="text-[9.5px] text-slate-400">
                        Parcelas com status NÃO OK
                    </span>
                </div>

                <div
                    onClick={() => setModalDespesasAberta(true)}
                    className="bg-white rounded-xl border border-red-200 p-3 cursor-pointer hover:bg-red-50/30 transition"
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                        Despesa Total ({registro.despesas.length} itens)
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-red-600 mt-0.5 block">
                        {formatarMoedaBRL(registro.despesaTotal)}
                    </strong>
                    <span className="text-[9.5px] text-slate-400 underline">
                        Clique para gerenciar despesas
                    </span>
                </div>

                <div className="bg-white rounded-xl border border-blue-200 p-3 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1056f5] block">
                        Valor Líquido Final
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-[#1056f5] mt-0.5 block">
                        {formatarMoedaBRL(registro.valorLiquido)}
                    </strong>
                    <span className="text-[9.5px] text-slate-400">
                        Receita Total − Despesas
                    </span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-5 space-y-3">
                    <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-[0_1px_6px_rgba(15,23,42,0.02)] space-y-3.5">
                        <div className="border-b border-slate-200 pb-2">
                            <h2 className="text-sm font-bold text-slate-900">
                                Compartilhar — Dados Operacionais
                            </h2>
                            <p className="text-[10.5px] text-slate-400">
                                Edite qualquer campo e pressione Enter ou clique fora para salvar
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xs font-bold underline text-slate-700">
                                Contato
                            </h3>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                    Nome / Telefone:
                                </label>
                                <input
                                    type="text"
                                    value={contatoInput}
                                    onChange={(e) => setContatoInput(e.target.value)}
                                    onKeyDown={confirmarComEnter}
                                    onBlur={() => {
                                        if (contatoInput !== registro.contato_nome_telefone) {
                                            atualizarDadosCompartilharEvento(registro.evento_id, {
                                                contato_nome_telefone: contatoInput.toUpperCase(),
                                            })
                                            exibirFeedbackSalvo()
                                        }
                                    }}
                                    placeholder="Ex: GUSTAVO 44 99868183"
                                    className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xs font-bold underline text-slate-700">
                                Diária
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                        Sim / Não:
                                    </label>
                                    <select
                                        value={registro.diaria_ativa ? 'SIM' : 'NAO'}
                                        onChange={(e) => {
                                            atualizarDadosCompartilharEvento(registro.evento_id, {
                                                diaria_ativa: e.target.value === 'SIM',
                                            })
                                            exibirFeedbackSalvo()
                                        }}
                                        className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none cursor-pointer"
                                    >
                                        <option value="SIM">Sim</option>
                                        <option value="NAO">Não</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                        Valor ({formatarMoedaBRL(registro.diaria_valor)}):
                                    </label>
                                    <input
                                        type="text"
                                        value={diariaValorInput}
                                        onChange={(e) => setDiariaValorInput(e.target.value)}
                                        onKeyDown={confirmarComEnter}
                                        onBlur={() => {
                                            const val =
                                                converterTextoParaValorMonetario(diariaValorInput)
                                            atualizarDadosCompartilharEvento(registro.evento_id, {
                                                diaria_valor: val,
                                            })
                                            setDiariaValorInput(String(val))
                                            exibirFeedbackSalvo()
                                        }}
                                        placeholder="Ex: 3500 ou 3,5K"
                                        className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xs font-bold underline text-slate-700">
                                Produção Local
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                        Custos:
                                    </label>
                                    <input
                                        type="text"
                                        value={custosInput}
                                        onChange={(e) => setCustosInput(e.target.value)}
                                        onKeyDown={confirmarComEnter}
                                        onBlur={() => {
                                            if (custosInput !== registro.producao_custos) {
                                                atualizarDadosCompartilharEvento(registro.evento_id, {
                                                    producao_custos: custosInput.toUpperCase(),
                                                })
                                                exibirFeedbackSalvo()
                                            }
                                        }}
                                        className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                        Operacional:
                                    </label>
                                    <input
                                        type="text"
                                        value={operacionalInput}
                                        onChange={(e) => setOperacionalInput(e.target.value)}
                                        onKeyDown={confirmarComEnter}
                                        onBlur={() => {
                                            if (operacionalInput !== registro.producao_operacional) {
                                                atualizarDadosCompartilharEvento(registro.evento_id, {
                                                    producao_operacional: operacionalInput.toUpperCase(),
                                                })
                                                exibirFeedbackSalvo()
                                            }
                                        }}
                                        className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-[0_1px_6px_rgba(15,23,42,0.02)] space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    Despesas do Evento
                                </h2>
                                <p className="text-[10.5px] text-slate-400">
                                    Total lançado: {formatarMoedaBRL(registro.despesaTotal)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalDespesasAberta(true)}
                                className="h-7 inline-flex items-center gap-1 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white px-2.5 text-[11px] font-semibold cursor-pointer print:hidden"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Gerenciar Despesas</span>
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1056f5] text-white text-[10.5px] font-bold uppercase tracking-wider">
                                        <th className="py-1.5 px-2.5 text-center w-24">Data</th>
                                        <th className="py-1.5 px-2.5 text-right w-28">Valor</th>
                                        <th className="py-1.5 px-2.5">Justificativa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-[11px] text-slate-700">
                                    {registro.despesas.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-5 px-3 text-center text-slate-400"
                                            >
                                                Nenhuma despesa lançada.
                                            </td>
                                        </tr>
                                    ) : (
                                        registro.despesas.map((d) => (
                                            <tr key={d.id} className="hover:bg-slate-50">
                                                <td className="py-1.5 px-2.5 text-center text-slate-500">
                                                    {d.data_despesa.split('-').reverse().join('/')}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-right font-bold text-red-600">
                                                    {formatarMoedaBRL(d.valor)}
                                                </td>
                                                <td className="py-1.5 px-2.5 truncate max-w-[180px]">
                                                    {d.justificativa}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-[0_1px_6px_rgba(15,23,42,0.02)] space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Pagamento e Parcelas ({registro.quantidadeParcelasPagas}/
                                {registro.quantidadeParcelasTotal} pagas)
                            </h2>
                            <p className="text-[10.5px] text-slate-400">
                                Cadastre parcelas individuais ou gere o parcelamento automático
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                            <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1">
                                <Percent className="w-3.5 h-3.5 text-amber-600" />
                                <label className="text-[10.5px] font-bold text-amber-900">
                                    Desconto (opcional):
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.5"
                                    value={descontoPctInput}
                                    onChange={(e) => setDescontoPctInput(e.target.value)}
                                    onKeyDown={confirmarComEnter}
                                    onBlur={() => {
                                        const pct = Math.min(
                                            100,
                                            Math.max(0, Number(descontoPctInput) || 0)
                                        )
                                        atualizarDadosCompartilharEvento(registro.evento_id, {
                                            desconto_percentual: pct,
                                        })
                                        setDescontoPctInput(String(pct))
                                        exibirFeedbackSalvo()
                                    }}
                                    className="w-14 h-6 rounded border border-amber-300 bg-white px-1.5 text-center text-xs font-extrabold text-amber-900 focus:outline-none"
                                />
                                <span className="text-xs font-bold text-amber-800">%</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMostrarGeradorAuto((v) => !v)}
                                className="h-8 inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1056f5] px-2.5 text-[11px] font-bold transition cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Gerar N Parcelas</span>
                            </button>
                        </div>
                    </div>

                    {mostrarGeradorAuto && (
                        <form
                            onSubmit={manipularGerarParcelamento}
                            className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end print:hidden"
                        >
                            <div className="sm:col-span-4">
                                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                                    Valor Total do Show (R$)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 300000 ou 300K"
                                    value={valorTotalAutoInput}
                                    onChange={(e) => setValorTotalAutoInput(e.target.value)}
                                    className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                                    Qtd. de Parcelas
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={36}
                                    value={qtdAutoParcelas}
                                    onChange={(e) => setQtdAutoParcelas(e.target.value)}
                                    className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-5 flex items-center gap-1.5">
                                <button
                                    type="submit"
                                    className="flex-1 h-8 rounded-lg bg-[#1056f5] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                                >
                                    Dividir Automaticamente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMostrarGeradorAuto(false)}
                                    className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    <form
                        onSubmit={manipularAdicionarParcela}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end print:hidden"
                    >
                        <div className="sm:col-span-2">
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                                Parcela
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={numeroParcelaInput}
                                onChange={(e) => setNumeroParcelaInput(e.target.value)}
                                className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                                Data pagamento
                            </label>
                            <input
                                type="date"
                                value={dataPagamentoInput}
                                onChange={(e) => setDataPagamentoInput(e.target.value)}
                                className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                                Valor (R$)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 50000 ou 50K"
                                value={valorParcelaInput}
                                onChange={(e) => setValorParcelaInput(e.target.value)}
                                className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <button
                                type="submit"
                                className="w-full h-8 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2b4c7e] hover:bg-[#1056f5] text-white px-3 text-xs font-bold transition cursor-pointer shadow-2xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Novo pagamento</span>
                            </button>
                        </div>
                    </form>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1056f5] text-white text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-2 px-3 text-center w-20">Parcela</th>
                                    <th className="py-2 px-3 text-center w-32">Data</th>
                                    <th className="py-2 px-3 text-right">Valor Bruto</th>
                                    {registro.desconto_percentual > 0 && (
                                        <th className="py-2 px-3 text-right">
                                            Valor c/ Desc. (-{registro.desconto_percentual}%)
                                        </th>
                                    )}
                                    <th className="py-2 px-3 text-center w-32">Status</th>
                                    <th className="py-2 px-3 text-center w-24 print:hidden">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                {registro.parcelas.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={registro.desconto_percentual > 0 ? 6 : 5}
                                            className="py-8 px-4 text-center text-slate-400"
                                        >
                                            Nenhuma parcela cadastrada para este evento.
                                        </td>
                                    </tr>
                                ) : (
                                    registro.parcelas.map((parc) => {
                                        const estaEditando = parcelaEditandoId === parc.id
                                        const valorLiquidoParcela = parc.valor_bruto * fatorDesconto

                                        return (
                                            <tr
                                                key={parc.id}
                                                className="hover:bg-blue-50/35 transition-colors"
                                            >
                                                <td className="py-2 px-3 text-center font-bold text-[#1056f5]">
                                                    {parc.numero_parcela}ª
                                                </td>

                                                <td className="py-2 px-3 text-center font-medium text-slate-700">
                                                    {estaEditando ? (
                                                        <input
                                                            type="date"
                                                            value={dataEditandoParcela}
                                                            onChange={(e) =>
                                                                setDataEditandoParcela(e.target.value)
                                                            }
                                                            className="w-full h-7 rounded border border-blue-400 px-1.5 text-[11px]"
                                                        />
                                                    ) : (
                                                        parc.data_pagamento.split('-').reverse().join('-')
                                                    )}
                                                </td>

                                                <td className="py-2 px-3 text-right font-bold text-slate-800">
                                                    {estaEditando ? (
                                                        <input
                                                            type="text"
                                                            value={valorEditandoParcela}
                                                            onChange={(e) =>
                                                                setValorEditandoParcela(e.target.value)
                                                            }
                                                            className="w-28 h-7 rounded border border-blue-400 px-2 text-right text-[11px]"
                                                        />
                                                    ) : (
                                                        formatarMoedaBRL(parc.valor_bruto)
                                                    )}
                                                </td>

                                                {registro.desconto_percentual > 0 && (
                                                    <td className="py-2 px-3 text-right font-extrabold text-emerald-700">
                                                        {formatarMoedaBRL(valorLiquidoParcela)}
                                                    </td>
                                                )}

                                                <td className="py-2 px-3 text-center">
                                                    <select
                                                        value={parc.status}
                                                        onChange={(e) => {
                                                            atualizarParcela(registro.evento_id, parc.id, {
                                                                status: e.target.value as TStatusParcela,
                                                            })
                                                            exibirFeedbackSalvo()
                                                        }}
                                                        className={`h-7 rounded-md px-2.5 text-[11px] font-extrabold border transition cursor-pointer focus:outline-none ${parc.status === 'OK'
                                                                ? 'bg-emerald-200/80 text-emerald-900 border-emerald-300'
                                                                : 'bg-red-200/80 text-red-900 border-red-300'
                                                            }`}
                                                    >
                                                        <option value="OK">OK</option>
                                                        <option value="NAO_OK">NÃO OK</option>
                                                    </select>
                                                </td>

                                                <td className="py-2 px-3 text-center print:hidden">
                                                    <div className="inline-flex items-center justify-center gap-1">
                                                        {estaEditando ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const novoVal =
                                                                        converterTextoParaValorMonetario(
                                                                            valorEditandoParcela
                                                                        )
                                                                    if (novoVal > 0 && dataEditandoParcela) {
                                                                        atualizarParcela(
                                                                            registro.evento_id,
                                                                            parc.id,
                                                                            {
                                                                                valor_bruto: novoVal,
                                                                                data_pagamento: dataEditandoParcela,
                                                                            }
                                                                        )
                                                                    }
                                                                    setParcelaEditandoId(null)
                                                                    exibirFeedbackSalvo()
                                                                }}
                                                                title="Confirmar edição"
                                                                className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-pointer"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setParcelaEditandoId(parc.id)
                                                                    setValorEditandoParcela(
                                                                        String(parc.valor_bruto)
                                                                    )
                                                                    setDataEditandoParcela(parc.data_pagamento)
                                                                }}
                                                                title="Editar parcela"
                                                                className="p-1 rounded text-slate-500 hover:text-[#1056f5] hover:bg-blue-50 cursor-pointer"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                excluirParcela(registro.evento_id, parc.id)
                                                            }
                                                            title="Excluir parcela"
                                                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>

                            <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-extrabold text-slate-800">
                                <tr>
                                    <td colSpan={2} className="py-2.5 px-3">
                                        TOTALIZADOR ({registro.quantidadeParcelasTotal} parcelas)
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                        {formatarMoedaBRL(registro.receitaBrutaParcelas)}
                                    </td>
                                    {registro.desconto_percentual > 0 && (
                                        <td className="py-2.5 px-3 text-right text-emerald-700">
                                            {formatarMoedaBRL(registro.receitaTotal)}
                                        </td>
                                    )}
                                    <td
                                        colSpan={2}
                                        className="py-2.5 px-3 text-right text-[11px]"
                                    >
                                        <span className="text-emerald-700 mr-2">
                                            Pago: {formatarMoedaBRL(registro.totalPago)}
                                        </span>
                                        <span className="text-red-600">
                                            Falta: {formatarMoedaBRL(registro.totalFaltaPagar)}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            </div>

            <ModalDespesasEvento
                registroEvento={modalDespesasAberta ? registro : null}
                aoFechar={() => setModalDespesasAberta(false)}
                aoAdicionarDespesa={adicionarDespesa}
                aoExcluirDespesa={excluirDespesa}
            />
        </div>
    )
}
