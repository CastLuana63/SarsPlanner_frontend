import React from 'react'
import type { TipoStatusEvento } from '@/types/agenda.types'

interface IEtiquetaStatusEventoProps {
    status: TipoStatusEvento
}

export const EtiquetaStatusEvento: React.FC<IEtiquetaStatusEventoProps> = ({ status }) => {
    const configuracaoPorStatus: Record<
        TipoStatusEvento,
        { rotulo: string; classesContainer: string; classePonto: string }
    > = {
        pendente: {
            rotulo: 'Pendente',
            classesContainer: 'bg-amber-50 text-amber-800 border-amber-200',
            classePonto: 'bg-red-500',
        },
        concluido: {
            rotulo: 'Concluído',
            classesContainer: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            classePonto: 'bg-emerald-500',
        },
        cancelado: {
            rotulo: 'Cancelado',
            classesContainer: 'bg-slate-100 text-slate-600 border-slate-300',
            classePonto: 'bg-slate-400',
        },
    }

    const configAtual = configuracaoPorStatus[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${configAtual.classesContainer}`}
        >
            <span className={`w-2 h-2 rounded-full ${configAtual.classePonto}`} />
            {configAtual.rotulo}
        </span>
    )
}
