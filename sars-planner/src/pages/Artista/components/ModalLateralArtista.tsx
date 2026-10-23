import React, { useState, useEffect } from 'react'
import { X, Mic2, Hash, Mail, Phone, Calendar } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import { CampoTexto } from '@/components/ui/CampoTexto'
import type { IArtista, IDadosFormularioArtista } from '@/types/artista.types'

interface IModalLateralArtistaProps {
    aberto: boolean
    artistaEmEdicao: IArtista | null
    aoFechar: () => void
    aoSalvar: (dados: IDadosFormularioArtista) => void
}

export const ModalLateralArtista: React.FC<IModalLateralArtistaProps> = ({
    aberto,
    artistaEmEdicao,
    aoFechar,
    aoSalvar,
}) => {
    const [nomeArtista, setNomeArtista] = useState<string>('')
    const [nomeSocial, setNomeSocial] = useState<string>('')
    const [emailArtista, setEmailArtista] = useState<string>('')
    const [telefoneArtista, setTelefoneArtista] = useState<string>('')
    const [quantidadeEventos, setQuantidadeEventos] = useState<string>('0')
    const [mensagemErro, setMensagemErro] = useState<string>('')

    useEffect(() => {
        if (artistaEmEdicao) {
            setNomeArtista(artistaEmEdicao.nome_artista)
            setNomeSocial(artistaEmEdicao.nome_social)
            setEmailArtista(artistaEmEdicao.email)
            setTelefoneArtista(artistaEmEdicao.telefone)
            setQuantidadeEventos(String(artistaEmEdicao.quantidade_eventos))
        } else {
            setNomeArtista('')
            setNomeSocial('')
            setEmailArtista('')
            setTelefoneArtista('')
            setQuantidadeEventos('0')
        }
        setMensagemErro('')
    }, [artistaEmEdicao, aberto])

    if (!aberto) return null

    const manipularSubmissao = (evento: React.FormEvent) => {
        evento.preventDefault()

        if (!nomeArtista.trim() || !nomeSocial.trim()) {
            setMensagemErro('Os campos Nome do Artista e Nome Social são obrigatórios.')
            return
        }

        aoSalvar({
            nome_artista: nomeArtista.trim().toUpperCase(),
            nome_social: nomeSocial.trim().toUpperCase(),
            email: emailArtista.trim().toLowerCase(),
            telefone: telefoneArtista.trim(),
            quantidade_eventos: Math.max(0, Number(quantidadeEventos) || 0),
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden">
            {/* Overlay escuro com blur */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={aoFechar}
            />

            {/* Drawer Lateral Direito */}
            <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
                <div>
                    {/* Cabeçalho do Modal Lateral */}
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                                <Mic2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                    {artistaEmEdicao
                                        ? 'Editar Artista / Apresentador'
                                        : 'Criar Artista / Apresentador'}
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Preencha as informações cadastrais abaixo
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={aoFechar}
                            title="Fechar painel"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Formulário */}
                    <form
                        id="form-artista"
                        onSubmit={manipularSubmissao}
                        className="p-5 space-y-4"
                    >
                        {mensagemErro && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-600">
                                {mensagemErro}
                            </div>
                        )}

                        <CampoTexto
                            id="id_nome_artista"
                            rotulo="Nome artista / apresentador *"
                            placeholder="Ex: CLAYTON E ROMÁRIO"
                            maxLength={255}
                            value={nomeArtista}
                            onChange={(e) => setNomeArtista(e.target.value)}
                            iconeEsquerda={<Mic2 className="w-4 h-4" />}
                            required
                        />

                        <CampoTexto
                            id="id_nome_social"
                            rotulo="Nome social / sigla *"
                            placeholder="Ex: C&R"
                            maxLength={255}
                            value={nomeSocial}
                            onChange={(e) => setNomeSocial(e.target.value)}
                            iconeEsquerda={<Hash className="w-4 h-4" />}
                            required
                        />

                        <CampoTexto
                            id="id_email_artista"
                            rotulo="E-mail de contato"
                            type="email"
                            placeholder="contato@artista.com.br"
                            maxLength={255}
                            value={emailArtista}
                            onChange={(e) => setEmailArtista(e.target.value)}
                            iconeEsquerda={<Mail className="w-4 h-4" />}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <CampoTexto
                                id="id_telefone"
                                rotulo="Telefone"
                                placeholder="(00) 00000-0000"
                                maxLength={17}
                                value={telefoneArtista}
                                onChange={(e) => setTelefoneArtista(e.target.value)}
                                iconeEsquerda={<Phone className="w-4 h-4" />}
                            />

                            <CampoTexto
                                id="id_quantidade_eventos"
                                rotulo="Qtd. de Eventos"
                                type="number"
                                min={0}
                                value={quantidadeEventos}
                                onChange={(e) => setQuantidadeEventos(e.target.value)}
                                iconeEsquerda={<Calendar className="w-4 h-4" />}
                            />
                        </div>
                    </form>
                </div>

                {/* Rodapé Fixo do Modal Lateral */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
                    <Botao
                        type="button"
                        variante="contorno"
                        larguraTotal={false}
                        onClick={aoFechar}
                    >
                        Cancelar
                    </Botao>

                    <Botao
                        type="submit"
                        form="form-artista"
                        variante="primario"
                        larguraTotal={false}
                    >
                        Salvar
                    </Botao>
                </div>
            </aside>
        </div>
    )
}
