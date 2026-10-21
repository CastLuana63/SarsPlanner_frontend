import type { LucideIcon } from 'lucide-react'

export interface IItemMenuLateral {
  id: string
  rotulo: string
  tituloTopo: string
  caminho: string
  icone: LucideIcon
}

export interface ISecaoMenuLateral {
  idSecao: string
  tituloSecao: string
  itens: IItemMenuLateral[]
}
