import React from 'react'
import type { ICartaoTotalizadorProps, TipoVarianteDestaque } from '@/types/navegacao.types'

export const CartaoTotalizador: React.FC<ICartaoTotalizadorProps> = ({
    titulo,
    valorTotal,
    legendaAuxiliar,
    icone: IconeComponente,
    varianteCor = 'azul',
    exibirIndicadorOnline = false,
}) => {
    const estilosIconePorCor: Record<TipoVarianteDestaque, string> = {
        azul: 'bg-blue-50 text-[#1056f5] border-blue-100',
        verde: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    }

    return (
        <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex items-start justify-between gap-4">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {titulo}
                    </span>

                    {exibirIndicadorOnline && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online agora
                        </span>
                    )}
                </div>

                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {valorTotal}
                </div>

                <p className="text-xs text-slate-500">{legendaAuxiliar}</p>
            </div>

            <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${estilosIconePorCor[varianteCor]}`}
            >
                <IconeComponente className="w-5 h-5" />
            </div>
        </article>
    )
}
