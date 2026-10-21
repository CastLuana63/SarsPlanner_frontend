import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, Building2, KeyRound, Globe } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import { CampoTexto } from '@/components/ui/CampoTexto'
import { LogoSarsPlanner } from '@/components/ui/LogoSarsPlanner'
import { useAutenticacao } from '@/contexts/AutenticacaoContext'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { realizarLoginInterno } = useAutenticacao()

  const [exibirLoginInterno, setExibirLoginInterno] = useState<boolean>(false)
  const [emailUsuario, setEmailUsuario] = useState<string>('')
  const [senhaUsuario, setSenhaUsuario] = useState<string>('')
  const [mensagemErro, setMensagemErro] = useState<string>('')
  const [avisoProvedorExterno, setAvisoProvedorExterno] = useState<string>('')

  const manipularSubmissaoLoginInterno = (evento: React.FormEvent) => {
    evento.preventDefault()
    setMensagemErro('')

    if (!emailUsuario.trim() || !senhaUsuario.trim()) {
      setMensagemErro('Preencha o e-mail e a senha para continuar.')
      return
    }

    const resultado = realizarLoginInterno(emailUsuario, senhaUsuario)
    if (!resultado.sucesso) {
      setMensagemErro(resultado.mensagem)
      return
    }

    navigate('/inicio')
  }

  const manipularCliqueProvedorExterno = (nomeProvedor: string) => {
    setAvisoProvedorExterno(
      `Autenticação via ${nomeProvedor} em desenvolvimento. Utilize o "Login Interno" para acessar.`
    )
  }

  const abrirModoLoginInterno = () => {
    setAvisoProvedorExterno('')
    setMensagemErro('')
    setExibirLoginInterno(true)
  }

  const voltarParaOpcoesLogin = () => {
    setMensagemErro('')
    setExibirLoginInterno(false)
  }

  return (
    <main className="min-h-screen w-full bg-[#eef2f6] flex items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-[880px] min-h-[470px] bg-white rounded-xl shadow-[0_10px_35px_rgba(15,23,42,0.06)] border border-slate-100 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Coluna Esquerda: Identidade Visual Sars Planner */}
        <div className="flex items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
          <LogoSarsPlanner />
        </div>

        {/* Coluna Direita: Opções de Acesso / Formulário Interno */}
        <div className="flex flex-col justify-between p-8 sm:p-10 md:p-12 bg-white">
          {/* Cabeçalho do Card */}
          <div className="text-center mt-2">
            <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#1a253c]">
              SarsDev + ShowPlanner
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {exibirLoginInterno
                ? 'Informe suas credenciais de acesso interno'
                : 'Acesse com seu e-mail corporativo'}
            </p>
          </div>

          {/* Corpo Central: Botões de Provedores OU Campos de Login Interno */}
          <div className="my-6">
            {avisoProvedorExterno && !exibirLoginInterno && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-800 text-center">
                {avisoProvedorExterno}
              </div>
            )}

            {!exibirLoginInterno ? (
              <div className="flex flex-col gap-2.5">
                <Botao
                  type="button"
                  variante="contorno"
                  iconeEsquerda={<Building2 className="w-4 h-4 text-slate-700" />}
                  onClick={() => manipularCliqueProvedorExterno('E-mail Corporativo')}
                >
                  Acessar com e-mail corporativo
                </Botao>

                <Botao
                  type="button"
                  variante="contorno"
                  iconeEsquerda={<Globe className="w-4 h-4 text-red-500" />}
                  onClick={() => manipularCliqueProvedorExterno('Google')}
                >
                  Google
                </Botao>

                <Botao
                  type="button"
                  variante="contorno"
                  iconeEsquerda={""}
                  onClick={() => manipularCliqueProvedorExterno('GitHub')}
                >
                  GitHub
                </Botao>

                <Botao
                  type="button"
                  variante="contorno"
                  iconeEsquerda={""}
                  onClick={() => manipularCliqueProvedorExterno('LinkedIn')}
                >
                  LinkedIn
                </Botao>

                <Botao
                  type="button"
                  variante="primario"
                  iconeEsquerda={<KeyRound className="w-4 h-4" />}
                  onClick={abrirModoLoginInterno}
                >
                  Login interno
                </Botao>
              </div>
            ) : (
              <form onSubmit={manipularSubmissaoLoginInterno} className="flex flex-col gap-4">
                {mensagemErro && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-600 text-center">
                    {mensagemErro}
                  </div>
                )}

                <CampoTexto
                  id="campo-email"
                  rotulo="E-mail"
                  type="email"
                  placeholder="adm@gmail.com"
                  value={emailUsuario}
                  onChange={(e) => setEmailUsuario(e.target.value)}
                  iconeEsquerda={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                  required
                />

                <CampoTexto
                  id="campo-senha"
                  rotulo="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={senhaUsuario}
                  onChange={(e) => setSenhaUsuario(e.target.value)}
                  iconeEsquerda={<Lock className="w-4 h-4" />}
                  autoComplete="current-password"
                  required
                />

                <div className="flex flex-col gap-2 pt-1">
                  <Botao type="submit" variante="primario">
                    Entrar no SarsPlanner
                  </Botao>

                  <Botao
                    type="button"
                    variante="fantasma"
                    iconeEsquerda={<ArrowLeft className="w-4 h-4" />}
                    onClick={voltarParaOpcoesLogin}
                  >
                    Voltar para outras opções
                  </Botao>
                </div>
              </form>
            )}
          </div>

          {/* Rodapé do Card */}
          <footer className="text-center">
            <p className="text-xs text-slate-400">
              © 2026 SarsDev. Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
