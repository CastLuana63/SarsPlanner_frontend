export type TipoStatusEvento = 'pendente' | 'concluido' | 'cancelado'

export interface IEventoAgenda {
  id: number
  seq_empresa: number
  data_evento: string // Formato ISO: YYYY-MM-DD
  horario_inicio: string // "21:00"
  horario_fim: string // "23:30"
  status_evento: TipoStatusEvento
  realizado: boolean
  artista: string
  cidade_uf: string
  valor_show: string
  comissao: string
  vendedor: string
  producao: string
}

export interface IDiaCalendario {
  dataIso: string
  numeroDia: number
  ehMesAtual: boolean
  ehHoje: boolean
  eventosDoDia: IEventoAgenda[]
}
