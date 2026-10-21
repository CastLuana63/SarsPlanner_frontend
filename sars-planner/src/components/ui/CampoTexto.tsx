import React from 'react'

interface ICampoTextoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rotulo: string
  erro?: string
  iconeEsquerda?: React.ReactNode
}

export const CampoTexto: React.FC<ICampoTextoProps> = ({
  rotulo,
  erro,
  iconeEsquerda,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      <label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {rotulo}
      </label>
      <div className="relative flex items-center">
        {iconeEsquerda && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            {iconeEsquerda}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
            iconeEsquerda ? 'pl-10' : ''
          } ${erro ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {erro && <span className="text-xs text-red-600 font-medium">{erro}</span>}
    </div>
  )
}
