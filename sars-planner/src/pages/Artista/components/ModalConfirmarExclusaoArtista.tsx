import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import type { IArtista } from '@/types/artista.types'

interface IModalConfirmarExclusaoArtistaProps {
    artistaParaExcluir: IArtista | null
    aoCancelar: () => void
    aoConfirmar: (idArtista: number) => void
}

export const ModalConfirmarExclusaoArtista: React.FC<
    IModalConfirmarExclusaoArtistaProps
> = ({ artistaParaExcluir, aoCancelar, aoConfirmar }) => {
    if (!artistaParaExcluir) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={aoCancelar}
            />

            <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">
                            Deseja excluir este artista?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            O registro de{' '}
                            <strong className="text-slate-800">
                                {artistaParaExcluir.nome_artista} ({artistaParaExcluir.nome_social})
                            </strong>{' '}
                            será removido da listagem.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Botao
                        type="button"
                        variante="contorno"
                        larguraTotal={false}
                        onClick={aoCancelar}
                        className="text-xs py-1.5 px-3"
                    >
                        Cancelar
                    </Botao>

                    <button
                        type="button"
                        onClick={() => aoConfirmar(artistaParaExcluir.id)}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition cursor-pointer"
                    >
                        Sim, excluir
                    </button>
                </div>
            </div>
        </div>
    )
}