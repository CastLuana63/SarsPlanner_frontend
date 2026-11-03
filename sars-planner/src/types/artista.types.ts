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

export type TColunaFiltroArtista =
  | 'nome_artista'
  | 'nome_social'
  | 'email'
  | 'telefone'
  | 'quantidade_eventos'

export interface IFiltrosColunaArtista {
  textoNomeArtista: string
  textoNomeSocial: string
  textoEmail: string
  textoTelefoneNumeros: string
  textoQuantidadeEventos: string
  nomesArtistasSelecionados: string[]
  nomesSociaisSelecionados: string[]
  emailsSelecionados: string[]
  telefonesSelecionados: string[]
  quantidadesEventosSelecionadas: string[]
}
