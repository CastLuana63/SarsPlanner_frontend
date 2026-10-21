export interface IUsuarioMock {
  id: number
  nome: string
  email: string
  senha: string
  iniciais: string
  cargo: string
}

export interface IUsuarioAutenticado {
  id: number
  nome: string
  email: string
  iniciais: string
  cargo: string
}

export interface IRespostaAutenticacao {
  sucesso: boolean
  mensagem: string
}

export interface IAutenticacaoContexto {
  usuarioLogado: IUsuarioAutenticado | null
  estaAutenticado: boolean
  realizarLoginInterno: (email: string, senha: string) => IRespostaAutenticacao
  realizarLogout: () => void
}
