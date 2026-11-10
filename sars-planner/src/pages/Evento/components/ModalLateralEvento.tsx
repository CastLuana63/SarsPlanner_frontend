import React, { useState, useEffect } from 'react'
import { X, Calendar, Mic2, MapPin, DollarSign, UserCheck, Briefcase } from 'lucide-react'
import artistasMock from '@/mocks/artistasMock.json'
import { Botao } from '@/components/ui/Botao'
import { CampoTexto } from '@/components/ui/CampoTexto'
import { obterCoordenadasCidade } from '@/contexts/EventosContext'
import type { IEvento, IStatusEventoCustom } from '@/types/evento.types'
import type { IArtista } from '@/types/artista.types'

interface IModalLateralEventoProps {
    aberto: boolean
    eventoEmEdicao: IEvento | null
    listaStatus: IStatusEventoCustom[]
    aoFechar: () => void
    aoSalvar: (dadosEvento: Omit<IEvento, 'id'>) => void
}

export const ModalLateralEvento: React.FC<IModalLateralEventoProps> = ({
    aberto,
    eventoEmEdicao,
    listaStatus,
    aoFechar,
    aoSalvar,
}) => {
    const listaArtistas = artistasMock as IArtista[]

    const [artista, setArtista] = useState('C&R')
    const [dataEvento, setDataEvento] = useState('2026-10-24')
    const [horarioInicio, setHorarioInicio] = useState('22:00')
    const [horarioFim, setHorarioFim] = useState('00:00')
    const [cidade, setCidade] = useState('')
    const [uf, setUf] = useState('SP')
    const [valorShow, setValorShow] = useState('')
    const [comissao, setComissao] = useState('')
    const [vendedor, setVendedor] = useState('')
    const [producao, setProducao] = useState('')
    const [statusId, setStatusId] = useState('PENDENTE')
    const [realizado, setRealizado] = useState(false)

    useEffect(() => {
        if (eventoEmEdicao) {
            setArtista(eventoEmEdicao.artista)
            setDataEvento(eventoEmEdicao.data_evento)
            setHorarioInicio(eventoEmEdicao.horario_inicio)
            setHorarioFim(eventoEmEdicao.horario_fim)
            setCidade(eventoEmEdicao.cidade)
            setUf(eventoEmEdicao.uf)
            setValorShow(eventoEmEdicao.valor_show)
            setComissao(eventoEmEdicao.comissao)
            setVendedor(eventoEmEdicao.vendedor)
            setProducao(eventoEmEdicao.producao)
            setStatusId(eventoEmEdicao.status_id)
            setRealizado(eventoEmEdicao.realizado)
        } else {
            setArtista(listaArtistas[0]?.nome_social || 'C&R')
            setDataEvento('2026-10-28')
            setHorarioInicio('22:00')
            setHorarioFim('00:00')
            setCidade('')
            setUf('SP')
            setValorShow('')
            setComissao('')
            setVendedor('')
            setProducao('')
            setStatusId(listaStatus[0]?.id || 'PENDENTE')
            setRealizado(false)
        }
    }, [eventoEmEdicao, aberto])

    if (!aberto) return null

    const manipularSubmissao = (e: React.FormEvent) => {
        e.preventDefault()
        if (!cidade.trim() || !dataEvento) return

        const [ano, mes, dia] = dataEvento.split('-')
        const cidadeFormatada = cidade.trim()
        const ufFormatada = uf.trim().toUpperCase() || 'SP'
        const coords = obterCoordenadasCidade(cidadeFormatada, Date.now() % 100)

        aoSalvar({
            seq_empresa: eventoEmEdicao?.seq_empresa || 1,
            data_evento: dataEvento,
            dia_evento: dia || '01',
            mes_referencia: mes || '01',
            ano_referencia: ano || '2026',
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            realizado,
            artista,
            cidade: cidadeFormatada,
            uf: ufFormatada,
            cidade_uf: `${cidadeFormatada} - ${ufFormatada}`,
            latitude: eventoEmEdicao?.latitude ?? coords.latitude,
            longitude: eventoEmEdicao?.longitude ?? coords.longitude,
            valor_show: valorShow.trim().toUpperCase() || 'DEFINIR',
            comissao: comissao.trim().toUpperCase() || 'SEM',
            vendedor: vendedor.trim().toUpperCase() || 'A DEFINIR',
            producao: producao.trim().toUpperCase() || 'A DEFINIR',
            status_id: statusId,
        })
        aoFechar()
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={aoFechar}
            />

            <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
                <div>
                    <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    {eventoEmEdicao ? 'Editar Evento' : 'Cadastrar Novo Evento'}
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Sincronizado automaticamente com a Agenda e Mapa
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={aoFechar}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form
                        id="form-evento-lateral"
                        onSubmit={manipularSubmissao}
                        className="p-5 space-y-3.5"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Artista *
                                </label>
                                <div className="relative flex items-center">
                                    <Mic2 className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                                    <select
                                        value={artista}
                                        onChange={(e) => setArtista(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#1056f5] focus:outline-none"
                                    >
                                        {listaArtistas.map((art) => (
                                            <option key={art.id} value={art.nome_social}>
                                                {art.nome_social} — {art.nome_artista}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <CampoTexto
                                id="evento-data"
                                rotulo="Data do Show *"
                                type="date"
                                value={dataEvento}
                                onChange={(e) => setDataEvento(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CampoTexto
                                id="evento-hora-inicio"
                                rotulo="Horário Início"
                                type="time"
                                value={horarioInicio}
                                onChange={(e) => setHorarioInicio(e.target.value)}
                            />
                            <CampoTexto
                                id="evento-hora-fim"
                                rotulo="Horário Fim"
                                type="time"
                                value={horarioFim}
                                onChange={(e) => setHorarioFim(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <CampoTexto
                                    id="evento-cidade"
                                    rotulo="Cidade *"
                                    placeholder="Ex: Campo Grande"
                                    value={cidade}
                                    onChange={(e) => setCidade(e.target.value)}
                                    iconeEsquerda={<MapPin className="w-4 h-4" />}
                                    required
                                />
                            </div>
                            <CampoTexto
                                id="evento-uf"
                                rotulo="UF *"
                                placeholder="MS"
                                maxLength={2}
                                value={uf}
                                onChange={(e) => setUf(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CampoTexto
                                id="evento-valor"
                                rotulo="Valor Show"
                                placeholder="Ex: 220K + LOCAL"
                                value={valorShow}
                                onChange={(e) => setValorShow(e.target.value)}
                                iconeEsquerda={<DollarSign className="w-4 h-4" />}
                            />
                            <CampoTexto
                                id="evento-comissao"
                                rotulo="Comissão"
                                placeholder="Ex: 20K ou 10%"
                                value={comissao}
                                onChange={(e) => setComissao(e.target.value)}
                                iconeEsquerda={<Briefcase className="w-4 h-4" />}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CampoTexto
                                id="evento-vendedor"
                                rotulo="Vendedor"
                                placeholder="Ex: MARCOS PACHECO"
                                value={vendedor}
                                onChange={(e) => setVendedor(e.target.value)}
                                iconeEsquerda={<UserCheck className="w-4 h-4" />}
                            />
                            <CampoTexto
                                id="evento-producao"
                                rotulo="Produção"
                                placeholder="Ex: 60K - IMPOSTO"
                                value={producao}
                                onChange={(e) => setProducao(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">
                                    Status do Evento
                                </label>
                                <select
                                    value={statusId}
                                    onChange={(e) => setStatusId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#1056f5] focus:outline-none"
                                >
                                    {listaStatus.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.rotulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end pb-1.5">
                                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={realizado}
                                        onChange={(e) => setRealizado(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#1056f5] focus:ring-[#1056f5]"
                                    />
                                    <span>Evento já realizado</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

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
                        form="form-evento-lateral"
                        variante="primario"
                        larguraTotal={false}
                    >
                        Salvar Evento
                    </Botao>
                </div>
            </aside>
        </div>
    )
}
