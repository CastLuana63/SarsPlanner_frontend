import React, { createContext, useContext, useState, useEffect } from 'react'
import usuariosMock from '@/mocks/usuariosMock.json'
import type {
  IAutenticacaoContexto,
  IRespostaAutenticacao,
  IUsuarioAutenticado,
  IUsuarioMock,
} from '@/types/autenticacao.types'

const CHAVE_STORAGE_USUARIO = '@SarsPlanner:usuarioLogado'

const AutenticacaoContext = createContext<IAutenticacaoContexto | undefined>(undefined)

export const AutenticacaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<IUsuarioAutenticado | null>(null)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem(CHAVE_STORAGE_USUARIO)
    if (usuarioSalvo) {
      try {
        setUsuarioLogado(JSON.parse(usuarioSalvo))
      } catch {
        localStorage.removeItem(CHAVE_STORAGE_USUARIO)
      }
    }
  }, [])

  const realizarLoginInterno = (emailDigitado: string, senhaDigitada: string): IRespostaAutenticacao => {
    const listaUsuarios = usuariosMock as IUsuarioMock[]
    const usuarioEncontrado = listaUsuarios.find(
      (item) =>
        item.email.toLowerCase() === emailDigitado.trim().toLowerCase() &&
        item.senha === senhaDigitada
    )

    if (!usuarioEncontrado) {
      return {
        sucesso: false,
        mensagem: 'E-mail ou senha inválidos. Verifique suas credenciais.',
      }
    }

    const dadosSessao: IUsuarioAutenticado = {
      id: usuarioEncontrado.id,
      nome: usuarioEncontrado.nome,
      email: usuarioEncontrado.email,
      iniciais: usuarioEncontrado.iniciais,
      cargo: usuarioEncontrado.cargo,
    }

    setUsuarioLogado(dadosSessao)
    localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(dadosSessao))

    return {
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
    }
  }

  const realizarLogout = () => {
    setUsuarioLogado(null)
    localStorage.removeItem(CHAVE_STORAGE_USUARIO)
  }

  return (
    <AutenticacaoContext.Provider
      value={{
        usuarioLogado,
        estaAutenticado: Boolean(usuarioLogado),
        realizarLoginInterno,
        realizarLogout,
      }}
    >
      {children}
    </AutenticacaoContext.Provider>
  )
}

export const useAutenticacao = (): IAutenticacaoContexto => {
  const contexto = useContext(AutenticacaoContext)
  if (!contexto) {
    throw new Error('useAutenticacao deve ser utilizado dentro de um AutenticacaoProvider')
  }
  return contexto
}
