import React from 'react'

interface IEmDesenvolvimentoPageProps {
  tituloPagina: string
}

export const EmDesenvolvimentoPage: React.FC<IEmDesenvolvimentoPageProps> = ({
  tituloPagina,
}) => {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold text-slate-900">{tituloPagina}</h1>
      <p className="text-sm font-medium text-slate-500">Em desenvolvimento</p>
    </section>
  )
}
