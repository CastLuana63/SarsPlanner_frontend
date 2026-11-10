import React, { useState, useEffect } from 'react'
import { X, Palette, Plus } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import { CampoTexto } from '@/components/ui/CampoTexto'
import type { IStatusEventoCustom } from '@/types/evento.types'

const CORES_PREDEFINIDAS = [
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#1056f5',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#64748b',
]

interface IModalStatusEventoProps {
    aberto: boolean
    statusInicial: IStatusEventoCustom | null
    listaStatusExistentes: IStatusEventoCustom[]
    aoFechar: () => void
    aoSalvarStatus: (status: IStatusEventoCustom) => void
}

export const ModalStatusEvento: React.FC<IModalStatusEventoProps> = ({
    aberto,
    statusInicial,
    listaStatusExistentes,
    aoFechar,
    aoSalvarStatus,
}) => {
    const [modoCriacao, setModoCriacao] = useState(false)
    const [rotulo, setRotulo] = useState('')
    const [corHex, setCorHex] = useState('#ef4444')

    useEffect(() => {
        if (statusInicial && !modoCriacao) {
            setRotulo(statusInicial.rotulo)
            setCorHex(statusInicial.corHex)
        } else {
            setRotulo('')
            setCorHex('#1056f5')
        }
    }, [statusInicial, modoCriacao, aberto])

    if (!aberto) return null

    const manipularSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!rotulo.trim()) return

        const idGerado =
            !modoCriacao && statusInicial
                ? statusInicial.id
                : rotulo
                    .trim()
                    .toUpperCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '_')

        aoSalvarStatus({
            id: idGerado,
            rotulo: rotulo.trim().toUpperCase(),
            corHex,
        })
        setModoCriacao(false)
        aoFechar()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={aoFechar}
            />

            <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                {modoCriacao ? 'Novo Status de Evento' : 'Editar Status / Cor'}
                            </h3>
                            <p className="text-[10.5px] text-slate-500">
                                Personalize o nome e a cor da bolinha do status
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Alternador entre editar o status clicado ou criar um novo */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-600">
                        {modoCriacao
                            ? 'Criando novo status'
                            : `Editando: ${statusInicial?.rotulo || ''}`}
                    </span>
                    <button
                        type="button"
                        onClick={() => setModoCriacao((v) => !v)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1056f5] hover:underline cursor-pointer"
                    >
                        <Plus className="w-3 h-3" />
                        <span>{modoCriacao ? 'Editar atual' : 'Criar novo status'}</span>
                    </button>
                </div>

                <form onSubmit={manipularSubmit} className="space-y-3.5">
                    <CampoTexto
                        id="campo-rotulo-status"
                        rotulo="Nome do Status *"
                        placeholder="Ex: AGUARDANDO CONTRATO"
                        value={rotulo}
                        onChange={(e) => setRotulo(e.target.value)}
                        required
                    />

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                            Cor da Bolinha
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {CORES_PREDEFINIDAS.map((cor) => (
                                <button
                                    key={cor}
                                    type="button"
                                    onClick={() => setCorHex(cor)}
                                    style={{ backgroundColor: cor }}
                                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${corHex === cor
                                            ? 'scale-115 ring-2 ring-offset-2 ring-slate-800'
                                            : 'opacity-80 hover:opacity-100'
                                        }`}
                                />
                            ))}

                            <input
                                type="color"
                                value={corHex}
                                onChange={(e) => setCorHex(e.target.value)}
                                title="Escolher cor personalizada"
                                className="w-7 h-7 rounded cursor-pointer border border-slate-300 bg-white p-0.5"
                            />
                        </div>
                    </div>

                    {/* Lista rápida dos status existentes para seleção/edição */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Status Cadastrados (Clique para carregar)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {listaStatusExistentes.map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => {
                                        setModoCriacao(false)
                                        setRotulo(st.rotulo)
                                        setCorHex(st.corHex)
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                                >
                                    <span
                                        style={{ backgroundColor: st.corHex }}
                                        className="w-2 h-2 rounded-full"
                                    />
                                    <span>{st.rotulo}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Botao
                            type="button"
                            variante="contorno"
                            larguraTotal={false}
                            onClick={aoFechar}
                            className="text-xs py-1.5 px-3"
                        >
                            Cancelar
                        </Botao>
                        <Botao
                            type="submit"
                            variante="primario"
                            larguraTotal={false}
                            className="text-xs py-1.5 px-3.5"
                        >
                            Salvar Status
                        </Botao>
                    </div>
                </form>
            </div>
        </div>
    )
}
