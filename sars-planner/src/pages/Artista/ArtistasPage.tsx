import React, { useState, useMemo } from 'react'
import { Plus, FileSpreadsheet, Printer, Search } from 'lucide-react'
import artistasMock from '@/mocks/artistasMock.json'
import { Botao } from '@/components/ui/Botao'
import { TabelaArtistas } from './components/TabelaArtistas'
import { ModalLateralArtista } from './components/ModalLateralArtista'
import { ModalConfirmarExclusaoArtista } from './components/ModalConfirmarExclusaoArtista'
import type {
    IArtista,
    IConfiguracaoOrdenacaoArtista,
    IDadosFormularioArtista,
    TColunaOrdenavelArtista,
} from '@/types/artista.types'

export const ArtistasPage: React.FC = () => {
    const [listaArtistas, setListaArtistas] = useState<IArtista[]>(
        artistasMock as IArtista[]
    )
    const [termoBusca, setTermoBusca] = useState<string>('')

    // Estado de ordenação exclusiva: apenas uma coluna pode estar ativa por vez
    const [ordenacaoAtual, setOrdenacaoAtual] =
        useState<IConfiguracaoOrdenacaoArtista>({
            colunaAtiva: 'nome_artista',
            direcao: 'asc',
        })

    // Estados do Modal Lateral (Criar / Editar) e Modal de Exclusão
    const [modalLateralAberto, setModalLateralAberto] = useState<boolean>(false)
    const [artistaEmEdicao, setArtistaEmEdicao] = useState<IArtista | null>(null)
    const [artistaParaExcluir, setArtistaParaExcluir] = useState<IArtista | null>(
        null
    )

    // Alterna ordenação garantindo que ordenar uma coluna desative a outra
    const manipularAlternanciaOrdenacao = (colunaClicada: TColunaOrdenavelArtista) => {
        setOrdenacaoAtual((estadoAnterior) => {
            if (estadoAnterior.colunaAtiva === colunaClicada) {
                return {
                    colunaAtiva: colunaClicada,
                    direcao: estadoAnterior.direcao === 'asc' ? 'desc' : 'asc',
                }
            }
            // Se clicou na outra coluna, ativa a nova em 'asc' e desativa a anterior
            return {
                colunaAtiva: colunaClicada,
                direcao: 'asc',
            }
        })
    }

    // Filtra e aplica a ordenação alfabética exclusiva
    const artistasFiltradosEOrdenados = useMemo<IArtista[]>(() => {
        const termoLimpo = termoBusca.trim().toLowerCase()

        const filtrados = listaArtistas.filter((item) => {
            if (!termoLimpo) return true
            return (
                item.nome_artista.toLowerCase().includes(termoLimpo) ||
                item.nome_social.toLowerCase().includes(termoLimpo) ||
                item.email.toLowerCase().includes(termoLimpo)
            )
        })

        if (!ordenacaoAtual.colunaAtiva) {
            return filtrados
        }

        const coluna = ordenacaoAtual.colunaAtiva
        const multiplicador = ordenacaoAtual.direcao === 'asc' ? 1 : -1

        return [...filtrados].sort(
            (a, b) =>
                a[coluna].localeCompare(b[coluna], 'pt-BR', { sensitivity: 'base' }) *
                multiplicador
        )
    }, [listaArtistas, termoBusca, ordenacaoAtual])

    // Abre modal lateral para criação
    const abrirModalCriacao = () => {
        setArtistaEmEdicao(null)
        setModalLateralAberto(true)
    }

    // Abre modal lateral para edição
    const abrirModalEdicao = (artista: IArtista) => {
        setArtistaEmEdicao(artista)
        setModalLateralAberto(true)
    }

    // Salva novo artista ou atualiza existente
    const manipularSalvarArtista = (dadosFormulario: IDadosFormularioArtista) => {
        if (artistaEmEdicao) {
            setListaArtistas((listaAnterior) =>
                listaAnterior.map((item) =>
                    item.id === artistaEmEdicao.id
                        ? { ...item, ...dadosFormulario }
                        : item
                )
            )
        } else {
            const novoId =
                listaArtistas.length > 0
                    ? Math.max(...listaArtistas.map((item) => item.id)) + 1
                    : 1
            const novoRegistro: IArtista = {
                id: novoId,
                ...dadosFormulario,
            }
            setListaArtistas((listaAnterior) => [...listaAnterior, novoRegistro])
        }

        setModalLateralAberto(false)
        setArtistaEmEdicao(null)
    }

    // Confirma exclusão do artista
    const manipularConfirmarExclusao = (idArtista: number) => {
        setListaArtistas((listaAnterior) =>
            listaAnterior.filter((item) => item.id !== idArtista)
        )
        setArtistaParaExcluir(null)
    }

    // Exporta a grade atual para planilha CSV (compatível com Excel PT-BR)
    const exportarParaPlanilhaCsv = () => {
        const cabecalhos = [
            'Nome Artista',
            'Nome Social',
            'E-mail',
            'Telefone',
            'Quantidade de Eventos',
        ]

        const linhasCsv = artistasFiltradosEOrdenados.map((item) => [
            `"${item.nome_artista.replace(/"/g, '""')}"`,
            `"${item.nome_social.replace(/"/g, '""')}"`,
            `"${item.email.replace(/"/g, '""')}"`,
            `"${item.telefone.replace(/"/g, '""')}"`,
            String(item.quantidade_eventos),
        ])

        const conteudoCsv = [
            cabecalhos.join(';'),
            ...linhasCsv.map((linha) => linha.join(';')),
        ].join('\r\n')

        // Adiciona BOM (\uFEFF) para acentuação correta no Excel
        const blob = new Blob(['\uFEFF' + conteudoCsv], {
            type: 'text/csv;charset=utf-8;',
        })
        const urlDownload = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = urlDownload
        link.setAttribute('download', 'lista_artistas_sarsplanner.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(urlDownload)
    }

    // Exporta em PDF via impressão limpa do Header + Grade
    const exportarParaPdf = () => {
        window.print()
    }

    return (
        <div id="area-impressao-artistas" className="space-y-4">
            {/* Cabeçalho da Página (Mantido no Print do PDF) */}
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        Lista de Artistas
                    </h1>
                    <p className="text-xs text-slate-500">
                        Gerenciamento de artistas, apresentadores, contatos e volume de eventos
                    </p>
                </div>

                {/* Botões de Ação e Exportação (Ocultos na folha de impressão do PDF) */}
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <button
                        type="button"
                        onClick={exportarParaPlanilhaCsv}
                        title="Exportar grade em planilha CSV"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Exportar CSV</span>
                    </button>

                    <button
                        type="button"
                        onClick={exportarParaPdf}
                        title="Exportar grade e cabeçalho em PDF"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Exportar PDF</span>
                    </button>

                    <Botao
                        type="button"
                        variante="primario"
                        larguraTotal={false}
                        iconeEsquerda={<Plus className="w-4 h-4" />}
                        onClick={abrirModalCriacao}
                        className="text-xs py-2 px-3.5"
                    >
                        Criar Artista/Apresentador
                    </Botao>
                </div>
            </header>

            {/* Barra de Filtro Rápido e Indicador de Ordenação (Oculta no PDF) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 print:hidden">
                <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        placeholder="Buscar por nome, sigla ou e-mail..."
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                        Ordenado por:{' '}
                        <strong className="text-slate-800">
                            {ordenacaoAtual.colunaAtiva === 'nome_artista'
                                ? 'Nome Artista'
                                : 'Nome Social'}{' '}
                            ({ordenacaoAtual.direcao === 'asc' ? 'A-Z' : 'Z-A'})
                        </strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                        Total: <strong className="text-slate-800">{artistasFiltradosEOrdenados.length}</strong>
                    </span>
                </div>
            </div>

            {/* Tabela Principal de Artistas */}
            <TabelaArtistas
                listaArtistas={artistasFiltradosEOrdenados}
                ordenacaoAtual={ordenacaoAtual}
                aoAlternarOrdenacao={manipularAlternanciaOrdenacao}
                aoClicarEditar={abrirModalEdicao}
                aoClicarExcluir={(artista) => setArtistaParaExcluir(artista)}
            />

            {/* Modal Lateral (Drawer) de Criação / Edição */}
            <ModalLateralArtista
                aberto={modalLateralAberto}
                artistaEmEdicao={artistaEmEdicao}
                aoFechar={() => {
                    setModalLateralAberto(false)
                    setArtistaEmEdicao(null)
                }}
                aoSalvar={manipularSalvarArtista}
            />

            {/* Modal de Confirmação de Exclusão */}
            <ModalConfirmarExclusaoArtista
                artistaParaExcluir={artistaParaExcluir}
                aoCancelar={() => setArtistaParaExcluir(null)}
                aoConfirmar={manipularConfirmarExclusao}
            />
        </div>
    )
}
