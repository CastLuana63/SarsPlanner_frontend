import React from 'react'

type TipoVarianteBotao = 'contorno' | 'primario' | 'fantasma' | 'secundario'

interface IBotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: TipoVarianteBotao
  larguraTotal?: boolean
  iconeEsquerda?: React.ReactNode
}

export const Botao: React.FC<IBotaoProps> = ({
  children,
  variante = 'contorno',
  larguraTotal = true,
  iconeEsquerda,
  className = '',
  ...props
}) => {
  const estilosBase =
    'inline-flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const estilosPorVariante: Record<TipoVarianteBotao, string> = {
    contorno:
      'border border-slate-400 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-500 active:bg-slate-100',
    primario:
      'bg-[#1056f5] text-white border border-transparent hover:bg-blue-700 active:bg-blue-800 shadow-xs',
    secundario:
      'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 active:bg-slate-300',
    fantasma:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  }

  const classeLargura = larguraTotal ? 'w-full' : ''

  return (
    <button
      className={`${estilosBase} ${estilosPorVariante[variante]} ${classeLargura} ${className}`}
      {...props}
    >
      {iconeEsquerda && <span className="shrink-0">{iconeEsquerda}</span>}
      <span>{children}</span>
    </button>
  )
}
