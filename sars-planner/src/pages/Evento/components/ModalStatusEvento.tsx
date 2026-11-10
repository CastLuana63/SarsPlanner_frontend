import React, { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import type { IStatusPersonalizadoEvento } from '@/types/evento.types'

interface IModalStatusEventoProps {
    aberto: boolean
    statusInicialId: string
    listaStatus: IStatusPersonalizadoEvento[]
    aoFechar: () => void
    aoSalvarStatus: (
        idExistente: string | null,
        nome: string,
        corHex: string
    ) => void
}

export const ModalStatusEvento: React.FC<IModalStatusEventoProps> = ({
    aberto,
    statusInicialId,
    listaStatus,
    aoFechar,
    aoSalvarStatus,
}) => {
    const [modoNovoStatus, setModoNovoStatus] = useState<boolean>(false)
    const [statusSelecionadoId, setStatusSelecionadoId] =
        useState<string>(statusInicialId)
    const [nomeStatus, setNomeStatus] = useState<string>('')
    const [corStatusHex, setCorStatusHex] = useState<string>('#ef4444')

    useEffect(() => {
        if (!aberto) return
        setModoNovoStatus(false)
        const encontrado =
            listaStatus.find((st) => st.id === statusInicialId) || listaStatus[0]
        if (encontrado) {
            setStatusSelecionadoId(encontrado.id)
            setNomeStatus(encontrado.nome)
            setCorStatusHex(encontrado.corHex)
        }
    }, [aberto, statusInicialId, listaStatus])

    if (!aberto) return null

    const manipularTrocaStatusExistente = (novoId: string) => {
        if (novoId === '__NOVO__') {
            setModoNovoStatus(true)
            setNomeStatus('')
            setCorStatusHex('#1056f5')
            return
        }

        setModoNovoStatus(false)
        setStatusSelecionadoId(novoId)
        const encontrado = listaStatus.find((st) => st.id === novoId)
        if (encontrado) {
            setNomeStatus(encontrado.nome)
            setCorStatusHex(encontrado.corHex)
        }
    }

    const manipularSubmissao = (evento: React.FormEvent) => {
        evento.preventDefault()
        const nomeFinal = modoNovoStatus ? nomeStatus.trim() : nomeStatus
        if (!nomeFinal) return

        aoSalvarStatus(
            modoNovoStatus ? null : statusSelecionadoId,
            nomeFinal,
            corStatusHex
        )
        aoFechar()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={aoFechar}
            />

            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white border-2 border-[#334e68] shadow-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h3 className="text-base font-bold text-slate-800">
                        Editar ou Criar Status
                    </h3>
                    <button
                        type="button"
                        onClick={aoFechar}
                        className="w-6 h-6 rounded-full bg-[#334e68] text-white flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <form onSubmit={manipularSubmissao} className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                <span>Status Existente:</span>
                                <span
                                    style={{ backgroundColor: corStatusHex }}
                                    className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-2xs"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    manipularTrocaStatusExistente(
                                        modoNovoStatus ? statusSelecionadoId : '__NOVO__'
                                    )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1056f5] hover:underline cursor-pointer"
                            >
                                <Plus className="w-3 h-3" />
                                <span>{modoNovoStatus ? 'Selecionar existente' : 'Criar novo'}</span>
                            </button>
                        </div>

                        {!modoNovoStatus ? (
                            <select
                                value={statusSelecionadoId}
                                onChange={(e) => manipularTrocaStatusExistente(e.target.value)}
                                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {listaStatus.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.nome}
                                    </option>
                                ))}
                                <option value="__NOVO__">+ Criar novo status...</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Digite o nome do novo status (Ex: AGUARDANDO)..."
                                value={nomeStatus}
                                onChange={(e) => setNomeStatus(e.target.value.toUpperCase())}
                                required
                                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        )}
                    </div>

                    {/* Seletor da Cor da Bolinha do Status */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                            Cor do Status:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={corStatusHex}
                                onChange={(e) => setCorStatusHex(e.target.value)}
                                className="w-full h-9 rounded-lg border border-slate-300 bg-white p-1 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={aoFechar}
                            className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-1.5 text-xs font-semibold transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#334e68] hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-semibold transition cursor-pointer"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
