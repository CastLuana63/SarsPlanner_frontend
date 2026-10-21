import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ICartaoAtalhoProps } from '@/types/navegacao.types'

export const CartaoAtalhoNavegacao: React.FC<ICartaoAtalhoProps> = ({
    item,
    categoriaSecao,
}) => {
    const IconeComponente = item.icone

    return (
        <Link
            to={item.caminho}
            className="group bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between min-h-[148px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:border-[#1056f5] hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#1056f5] group-hover:text-white flex items-center justify-center transition-colors duration-150 shrink-0">
                    <IconeComponente className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                    {categoriaSecao && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {categoriaSecao}
                        </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#1056f5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
                </div>
            </div>

            <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1056f5] transition-colors">
                    {item.rotulo}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.descricao}
                </p>
            </div>
        </Link>
    )
}