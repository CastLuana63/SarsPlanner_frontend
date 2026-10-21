import React from 'react'
import { CalendarRange } from 'lucide-react'

export const LogoSarsPlanner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center select-none text-center p-6">
      <div className="relative flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-[#1e2f8f] to-[#1056f5] shadow-md mb-5">
        <CalendarRange className="w-14 h-14 text-white stroke-[1.8]" />
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 border-4 border-white" />
      </div>

      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e2f8f]">
        Sars Planner
      </h2>
      <span className="mt-1 text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
        Gestão de Eventos
      </span>
    </div>
  )
}
