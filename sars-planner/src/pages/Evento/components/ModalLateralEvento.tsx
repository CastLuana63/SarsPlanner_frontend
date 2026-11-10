import React, { useState, useEffect } from 'react'
import { X, CalendarPlus } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import { COORDENADAS_PADRAO_POR_UF } from '@/contexts/EventosContext'
import artistasMock from '@/mocks/artistasMock.json'
import type {
    IEventoSistema,
    IStatusPersonalizadoEvento,
    TDadosFormularioEvento,
} from '@/types/evento.types'
import type { IArtista } from '@/types/artista.types'

interface IModalLateralEventoProps {
    aberto: boolean
    eventoEmEdicao: IEventoSistema | null
    listaStatus: IStatusPersonalizadoEvento[]
    aoAbrirModalStatus: (statusAtualId: string) => void
    aoFechar: () => void
    aoSalvar: (dados: TDadosFormularioEvento) => void
}

export const ModalLateralEvento: React.FC<IModalLateralEventoProps> = ({
    aberto,
    eventoEmEdicao,
    listaStatus,
    aoAbrirModalStatus,
    aoFechar,
    aoSalvar,
}) => {
    const listaArtistasCadastrados = artistasMock as IArtista[]

    const [dataEvento, setDataEvento] = useState<string>('2026-10-25')
    const [horarioInicio, setHorarioInicio] = useState<string>('22:00')
    const [horarioFim, setHorarioFim] = useState<string>('00:00')
    const [artista, setArtista] = useState<string>('C&R')
    const [statusId, setStatusId] = useState<string>('PENDENTE')
    const [realizado, setRealizado] = useState<boolean>(false)
    const [valorShow, setValorShow] = useState<string>('')
    const [uf, setUf] = useState<string>('SP')
    const [cidade, setCidade] = useState<string>('')
    const [comissao, setComissao] = useState<string>('')
    const [producao, setProducao] = useState<string>('')
    const [vendedor, setVendedor] = useState<string>('')
    const [pendencia, setPendencia] = useState<string>('')
    const [anotacoes, setAnotacoes] = useState<string>('')

    // Contrato
    const [dataEnviadoContrato, setDataEnviadoContrato] = useState<string>('')
    const [dataAssinadoContrato, setDataAssinadoContrato] = useState<string>('')

    // Financeiro
    const [receitaTotal, setReceitaTotal] = useState<string>('0,00')
    const [despesaTotal, setDespesaTotal] = useState<string>('0,00')

    // Compartilhar
    const [contatoNomeTelefone, setContatoNomeTelefone] = useState<string>('')
    const [diariaSimNao, setDiariaSimNao] = useState<'Sim' | 'Não'>('Sim')
    const [valorDiaria, setValorDiaria] = useState<string>('')
    const [custosProducaoLocal, setCustosProducaoLocal] = useState<string>('')
    const [operacionalProducaoLocal, setOperacionalProducaoLocal] =
        useState<string>('')

    useEffect(() => {
        if (eventoEmEdicao) {
            setDataEvento(eventoEmEdicao.data_evento)
            setHorarioInicio(eventoEmEdicao.horario_inicio)
            setHorarioFim(eventoEmEdicao.horario_fim)
            setArtista(eventoEmEdicao.artista)
            setStatusId(eventoEmEdicao.status_id)
            setRealizado(eventoEmEdicao.realizado)
            setValorShow(eventoEmEdicao.valor_show)
            setUf(eventoEmEdicao.uf)
            setCidade(eventoEmEdicao.cidade)
            setComissao(eventoEmEdicao.comissao)
            setProducao(eventoEmEdicao.producao)
            setVendedor(eventoEmEdicao.vendedor)
            setPendencia(eventoEmEdicao.pendencia)
            setAnotacoes(eventoEmEdicao.anotacoes)
            setDataEnviadoContrato(eventoEmEdicao.data_enviado_contrato)
            setDataAssinadoContrato(eventoEmEdicao.data_assinado_contrato)
            setReceitaTotal(eventoEmEdicao.receita_total)
            setDespesaTotal(eventoEmEdicao.despesa_total)
            setContatoNomeTelefone(eventoEmEdicao.contato_nome_telefone)
            setDiariaSimNao(eventoEmEdicao.diaria_sim_nao)
            setValorDiaria(eventoEmEdicao.valor_diaria)
            setCustosProducaoLocal(eventoEmEdicao.custos_producao_local)
            setOperacionalProducaoLocal(eventoEmEdicao.operacional_producao_local)
        } else {
            setDataEvento('2026-10-28')
            setHorarioInicio('22:00')
            setHorarioFim('00:00')
            setArtista(listaArtistasCadastrados[0]?.nome_social || 'C&R')
            setStatusId('PENDENTE')
            setRealizado(false)
            setValorShow('')
            setUf('SP')
            setCidade('')
            setComissao('')
            setProducao('')
            setVendedor('')
            setPendencia('')
            setAnotacoes('')
            setDataEnviadoContrato('')
            setDataAssinadoContrato('')
            setReceitaTotal('0,00')
            setDespesaTotal('0,00')
            setContatoNomeTelefone('')
            setDiariaSimNao('Sim')
            setValorDiaria('')
            setCustosProducaoLocal('')
            setOperacionalProducaoLocal('')
        }
    }, [eventoEmEdicao, aberto])

    if (!aberto) return null

    const statusAtualObj =
        listaStatus.find((st) => st.id === statusId) || listaStatus[0]

    const manipularSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!cidade.trim() || !dataEvento) return

        const infoEstado = COORDENADAS_PADRAO_POR_UF[uf] || {
            lat: -21.1775,
            lng: -47.8103,
            estado: uf,
        }

        aoSalvar({
            seq_empresa: eventoEmEdicao?.seq_empresa || 1,
            data_evento: dataEvento,
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            realizado,
            artista,
            estado: infoEstado.estado,
            uf,
            cidade: cidade.trim(),
            latitude: eventoEmEdicao?.latitude ?? infoEstado.lat,
            longitude: eventoEmEdicao?.longitude ?? infoEstado.lng,
            valor_show: valorShow.trim().toUpperCase() || 'A DEFINIR',
            comissao: comissao.trim().toUpperCase() || 'SEM',
            vendedor: vendedor.trim().toUpperCase() || 'A DEFINIR',
            producao: producao.trim().toUpperCase() || 'EQUIPE LOCAL',
            status_id: statusId,
            pendencia: pendencia.trim(),
            anotacoes: anotacoes.trim(),
            data_enviado_contrato: dataEnviadoContrato,
            data_assinado_contrato: dataAssinadoContrato,
            receita_total: receitaTotal.trim() || '0,00',
            despesa_total: despesaTotal.trim() || '0,00',
            contato_nome_telefone: contatoNomeTelefone.trim().toUpperCase(),
            diaria_sim_nao: diariaSimNao,
            valor_diaria: valorDiaria.trim(),
            custos_producao_local: custosProducaoLocal.trim().toUpperCase(),
            operacional_producao_local: operacionalProducaoLocal.trim().toUpperCase(),
        })
    }

    const classesInput =
        'w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none focus:ring-2 focus:ring-blue-500/15'
    const classesLabel = 'block text-[11px] font-semibold text-slate-700 mb-1'

    return (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={aoFechar}
            />

            <aside className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                            <CalendarPlus className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">
                                {eventoEmEdicao ? 'Editar Evento' : 'Criar Evento'}
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Cadastro completo (Evento, Contrato, Financeiro e Compartilhar)
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form
                    id="form-lateral-evento"
                    onSubmit={manipularSubmit}
                    className="p-5 space-y-5 overflow-y-auto flex-1"
                >
                    <section className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                            Evento
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className={classesLabel}>Data Evento *</label>
                                <input
                                    type="date"
                                    value={dataEvento}
                                    onChange={(e) => setDataEvento(e.target.value)}
                                    required
                                    className={classesInput}
                                />
                            </div>

                            <div>
                                <label className={classesLabel}>Horário Início</label>
                                <input
                                    type="time"
                                    value={horarioInicio}
                                    onChange={(e) => setHorarioInicio(e.target.value)}
                                    className={classesInput}
                                />
                            </div>

                            <div>
                                <label className={classesLabel}>Realizado</label>
                                <select
                                    value={realizado ? 'SIM' : 'NAO'}
                                    onChange={(e) => setRealizado(e.target.value === 'SIM')}
                                    className={classesInput}
                                >
                                    <option value="NAO">Não Realizado</option>
                                    <option value="SIM">Realizado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className={classesLabel}>Artista *</label>
                                <select
                                    value={artista}
                                    onChange={(e) => setArtista(e.target.value)}
                                    className={classesInput}
                                >
                                    {listaArtistasCadastrados.map((art) => (
                                        <option key={art.id} value={art.nome_social}>
                                            {art.nome_social} — {art.nome_artista}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={classesLabel}>
                                    Status (2 cliques na bolinha p/ editar)
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={statusId}
                                        onChange={(e) => setStatusId(e.target.value)}
                                        className={classesInput}
                                    >
                                        {listaStatus.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.nome}
                                            </option>
                                        ))}
                                    </select>

                                    <span
                                        onDoubleClick={() => aoAbrirModalStatus(statusId)}
                                        title="Dê 2 cliques para criar ou editar a cor do status"
                                        style={{ backgroundColor: statusAtualObj?.corHex || '#ef4444' }}
                                        className="w-5 h-5 rounded-full shrink-0 cursor-pointer ring-2 ring-offset-1 ring-slate-300 hover:scale-110 transition-transform"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={classesLabel}>Valor Show</label>
                            <input
                                type="text"
                                placeholder="Ex: 220K + D3,5K + LOCAL"
                                value={valorShow}
                                onChange={(e) => setValorShow(e.target.value)}
                                className={classesInput}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className={classesLabel}>Estado (UF) *</label>
                                <select
                                    value={uf}
                                    onChange={(e) => setUf(e.target.value)}
                                    className={classesInput}
                                >
                                    {Object.entries(COORDENADAS_PADRAO_POR_UF).map(
                                        ([sigla, info]) => (
                                            <option key={sigla} value={sigla}>
                                                {sigla} - {info.estado}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className={classesLabel}>Cidade *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Guarulhos"
                                    value={cidade}
                                    onChange={(e) => setCidade(e.target.value)}
                                    required
                                    className={classesInput}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className={classesLabel}>Comissão</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 20K ou 10%"
                                    value={comissao}
                                    onChange={(e) => setComissao(e.target.value)}
                                    className={classesInput}
                                />
                            </div>

                            <div>
                                <label className={classesLabel}>Produção</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 60K - IMPOSTO"
                                    value={producao}
                                    onChange={(e) => setProducao(e.target.value)}
                                    className={classesInput}
                                />
                            </div>

                            <div>
                                <label className={classesLabel}>Vendedor</label>
                                <input
                                    type="text"
                                    placeholder="Ex: MARCOS PACHECO"
                                    value={vendedor}
                                    onChange={(e) => setVendedor(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={classesLabel}>Pendência</label>
                            <textarea
                                rows={2}
                                placeholder="Descreva pendências do evento..."
                                value={pendencia}
                                onChange={(e) => setPendencia(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:outline-none"
                            />
                        </div>
                    </section>

                    <section className="space-y-2.5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                            Contrato
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className={classesLabel}>Data Enviado</label>
                                <input
                                    type="date"
                                    value={dataEnviadoContrato}
                                    onChange={(e) => setDataEnviadoContrato(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                            <div>
                                <label className={classesLabel}>Data Assinado</label>
                                <input
                                    type="date"
                                    value={dataAssinadoContrato}
                                    onChange={(e) => setDataAssinadoContrato(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2.5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                            Financeiro
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className={classesLabel}>Receita Total</label>
                                <input
                                    type="text"
                                    placeholder="0,00"
                                    value={receitaTotal}
                                    onChange={(e) => setReceitaTotal(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                            <div>
                                <label className={classesLabel}>Despesa Total</label>
                                <input
                                    type="text"
                                    placeholder="0,00"
                                    value={despesaTotal}
                                    onChange={(e) => setDespesaTotal(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2.5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                            Compartilhar
                        </h3>

                        <div>
                            <label className={classesLabel}>Contato (Nome / Telefone)</label>
                            <input
                                type="text"
                                placeholder="Ex: GEOVANI 27 99785-0695"
                                value={contatoNomeTelefone}
                                onChange={(e) => setContatoNomeTelefone(e.target.value)}
                                className={classesInput}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className={classesLabel}>Diária (Sim/Não)</label>
                                <select
                                    value={diariaSimNao}
                                    onChange={(e) =>
                                        setDiariaSimNao(e.target.value as 'Sim' | 'Não')
                                    }
                                    className={classesInput}
                                >
                                    <option value="Sim">Sim</option>
                                    <option value="Não">Não</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={classesLabel}>Valor Diária</label>
                                <input
                                    type="text"
                                    placeholder="Valor diária"
                                    value={valorDiaria}
                                    onChange={(e) => setValorDiaria(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className={classesLabel}>Produção Local — Custos</label>
                                <input
                                    type="text"
                                    placeholder="Custos"
                                    value={custosProducaoLocal}
                                    onChange={(e) => setCustosProducaoLocal(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                            <div>
                                <label className={classesLabel}>
                                    Produção Local — Operacional
                                </label>
                                <input
                                    type="text"
                                    placeholder="Operacional"
                                    value={operacionalProducaoLocal}
                                    onChange={(e) => setOperacionalProducaoLocal(e.target.value)}
                                    className={classesInput}
                                />
                            </div>
                        </div>
                    </section>
                </form>

                <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                    <Botao
                        type="button"
                        variante="contorno"
                        larguraTotal={false}
                        onClick={aoFechar}
                        className="h-8 text-xs px-3 py-1"
                    >
                        Voltar
                    </Botao>
                    <Botao
                        type="submit"
                        form="form-lateral-evento"
                        variante="primario"
                        larguraTotal={false}
                        className="h-8 text-xs px-4 py-1"
                    >
                        Salvar
                    </Botao>
                </div>
            </aside>
        </div>
    )
}
