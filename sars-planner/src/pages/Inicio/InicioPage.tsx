import React from 'react'
import { Users, CalendarCheck2 } from 'lucide-react'
import { SECOES_MENU_LATERAL, ITEM_MENU_AJUDA } from '@/components/layout/Sidebar'
import { CartaoTotalizador } from '@/components/ui/CartaoTotalizador'
import { CartaoAtalhoNavegacao } from '@/components/ui/CartaoAtalhoNavegacao'
import type { IItemMenuLateral } from '@/types/navegacao.types'

interface IAtalhoComSecao {
  categoria: string
  item: IItemMenuLateral
}

export const InicioPage: React.FC = () => {
  const totalUsuariosLogadosAgora = 1
  const totalEventosAtivos = 0
  const listaAtalhosNavegacao: IAtalhoComSecao[] = [
    ...SECOES_MENU_LATERAL.flatMap((secao) =>
      secao.itens
        .filter((item) => item.id !== 'inicio')
        .map((item) => ({
          categoria: secao.tituloSecao,
          item,
        }))
    ),
    {
      categoria: 'SUPORTE',
      item: ITEM_MENU_AJUDA,
    },
  ]

  return (
    <div className="max-w-6xl space-y-8">
      <header aria-label="Resumo em tempo real do sistema" className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Visão Geral do Sistema
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CartaoTotalizador
            titulo="Usuários Ativos"
            valorTotal={totalUsuariosLogadosAgora}
            legendaAuxiliar="Usuários logados neste momento no sistema"
            icone={Users}
            varianteCor="verde"
            exibirIndicadorOnline={true}
          />

          <CartaoTotalizador
            titulo="Eventos Ativos"
            valorTotal={totalEventosAtivos}
            legendaAuxiliar="Total de eventos ativos em andamento"
            icone={CalendarCheck2}
            varianteCor="azul"
          />
        </div>
      </header>

      <section aria-label="Atalhos rápidos de navegação" className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Acesso Rápido aos Módulos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listaAtalhosNavegacao.map(({ categoria, item }) => (
            <CartaoAtalhoNavegacao
              key={item.id}
              item={item}
              categoriaSecao={categoria}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
