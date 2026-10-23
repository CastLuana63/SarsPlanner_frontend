export interface IArtista {
  id: number
  nome_artista: string
  nome_social: string
  email: string
  telefone: string
  quantidade_eventos: number
}

export interface IDadosFormularioArtista {
  nome_artista: string
  nome_social: string
  email: string
  telefone: string
  quantidade_eventos: number
}

export type TColunaOrdenavelArtista = 'nome_artista' | 'nome_social'

export type TDirecaoOrdenacao = 'asc' | 'desc'

export interface IConfiguracaoOrdenacaoArtista {
  colunaAtiva: TColunaOrdenavelArtista | null
  direcao: TDirecaoOrdenacao
}