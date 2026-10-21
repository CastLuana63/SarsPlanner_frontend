import type { LucideIcon } from 'lucide-react'

export interface IItemMenuLateral {
  id: string
  rotulo: string
  tituloTopo: string
  descricao: string
  caminho: string
  icone: LucideIcon
}

export interface ISecaoMenuLateral {
  idSecao: string
  tituloSecao: string
  itens: IItemMenuLateral[]
}

export type TipoVarianteDestaque = 'azul' | 'verde'

export interface ICartaoTotalizadorProps {
  titulo: string
  valorTotal: number | string
  legendaAuxiliar: string
  icone: LucideIcon
  varianteCor?: TipoVarianteDestaque
  exibirIndicadorOnline?: boolean
}

export interface ICartaoAtalhoProps {
  item: IItemMenuLateral
  categoriaSecao?: string
}
