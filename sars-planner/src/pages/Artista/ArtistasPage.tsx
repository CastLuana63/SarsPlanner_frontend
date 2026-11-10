import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    Plus,
    FileSpreadsheet,
    Printer,
    Search,
    MoreVertical,
    FilterX,
} from 'lucide-react'
import artistasMock from '@/mocks/artistasMock.json'
import { Botao } from '@/components/ui/Botao'
import { TabelaArtistas } from './components/TabelaArtistas'
import { ModalLateralArtista } from './components/ModalLateralArtista'
import { ModalConfirmarExclusaoArtista } from './components/ModalConfirmarExclusaoArtista'
import type {
    IArtista,
    IConfiguracaoOrdenacaoArtista,
    IDadosFormularioArtista,
    IFiltrosColunaArtista,
    TColunaFiltroArtista,
    TColunaOrdenavelArtista,
} from '@/types/artista.types'

const FILTROS_COLUNA_INICIAIS: IFiltrosColunaArtista = {
    textoNomeArtista: '',
    textoNomeSocial: '',
    textoEmail: '',
    textoTelefoneNumeros: '',
    textoQuantidadeEventos: '',
    nomesArtistasSelecionados: [],
    nomesSociaisSelecionados: [],
    emailsSelecionados: [],
    telefonesSelecionados: [],
    quantidadesEventosSelecionadas: [],
}

const extrairApenasNumeros = (valor: string): string => valor.replace(/\D/g, '')

export const ArtistasPage: React.FC = () => {
    const [listaArtistas, setListaArtistas] = useState<IArtista[]>(
        artistasMock as IArtista[]
    )
    const [termoBuscaGeral, setTermoBuscaGeral] = useState<string>('')
    const [filtrosColuna, setFiltrosColuna] = useState<IFiltrosColunaArtista>(
        FILTROS_COLUNA_INICIAIS
    )

    const [ordenacaoAtual, setOrdenacaoAtual] =
        useState<IConfiguracaoOrdenacaoArtista>({
            colunaAtiva: 'nome_artista',
            direcao: 'asc',
        })

    const [modalLateralAberto, setModalLateralAberto] = useState<boolean>(false)
    const [artistaEmEdicao, setArtistaEmEdicao] = useState<IArtista | null>(null)
    const [artistaParaExcluir, setArtistaParaExcluir] = useState<IArtista | null>(
        null
    )

    const [menuOpcoesAberto, setMenuOpcoesAberto] = useState<boolean>(false)
    const menuOpcoesRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const manipularCliqueFora = (evento: MouseEvent) => {
            if (
                menuOpcoesRef.current &&
                !menuOpcoesRef.current.contains(evento.target as Node)
            ) {
                setMenuOpcoesAberto(false)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const opcoesUnicasColunas = useMemo(() => {
        const nomesArtistas = Array.from(
            new Set(listaArtistas.map((a) => a.nome_artista).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

        const nomesSociais = Array.from(
            new Set(listaArtistas.map((a) => a.nome_social).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

        const emails = Array.from(
            new Set(listaArtistas.map((a) => a.email).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

        const telefones = Array.from(
            new Set(listaArtistas.map((a) => a.telefone).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

        const quantidadesEventos = Array.from(
            new Set(listaArtistas.map((a) => String(a.quantidade_eventos)))
        ).sort((a, b) => Number(a) - Number(b))

        return {
            nomesArtistas,
            nomesSociais,
            emails,
            telefones,
            quantidadesEventos,
        }
    }, [listaArtistas])

    const atualizarFiltroColuna = <K extends keyof IFiltrosColunaArtista>(
        campo: K,
        valor: IFiltrosColunaArtista[K]
    ) => {
        setFiltrosColuna((estadoAnterior) => ({
            ...estadoAnterior,
            [campo]: valor,
        }))
    }

    const limparColunaEspecifica = (coluna: TColunaFiltroArtista) => {
        setFiltrosColuna((estadoAnterior) => {
            switch (coluna) {
                case 'nome_artista':
                    return {
                        ...estadoAnterior,
                        textoNomeArtista: '',
                        nomesArtistasSelecionados: [],
                    }
                case 'nome_social':
                    return {
                        ...estadoAnterior,
                        textoNomeSocial: '',
                        nomesSociaisSelecionados: [],
                    }
                case 'email':
                    return {
                        ...estadoAnterior,
                        textoEmail: '',
                        emailsSelecionados: [],
                    }
                case 'telefone':
                    return {
                        ...estadoAnterior,
                        textoTelefoneNumeros: '',
                        telefonesSelecionados: [],
                    }
                case 'quantidade_eventos':
                    return {
                        ...estadoAnterior,
                        textoQuantidadeEventos: '',
                        quantidadesEventosSelecionadas: [],
                    }
            }
        })
    }

    const quantidadeFiltrosAtivos = useMemo<number>(() => {
        let total = 0
        if (termoBuscaGeral.trim() !== '') total++
        if (
            filtrosColuna.textoNomeArtista.trim() !== '' ||
            filtrosColuna.nomesArtistasSelecionados.length > 0
        ) {
            total++
        }
        if (
            filtrosColuna.textoNomeSocial.trim() !== '' ||
            filtrosColuna.nomesSociaisSelecionados.length > 0
        ) {
            total++
        }
        if (
            filtrosColuna.textoEmail.trim() !== '' ||
            filtrosColuna.emailsSelecionados.length > 0
        ) {
            total++
        }
        if (
            filtrosColuna.textoTelefoneNumeros.trim() !== '' ||
            filtrosColuna.telefonesSelecionados.length > 0
        ) {
            total++
        }
        if (
            filtrosColuna.textoQuantidadeEventos.trim() !== '' ||
            filtrosColuna.quantidadesEventosSelecionadas.length > 0
        ) {
            total++
        }
        return total
    }, [termoBuscaGeral, filtrosColuna])

    const limparTodosOsFiltros = () => {
        setTermoBuscaGeral('')
        setFiltrosColuna(FILTROS_COLUNA_INICIAIS)
    }

    const manipularAlternanciaOrdenacao = (
        colunaClicada: TColunaOrdenavelArtista
    ) => {
        setOrdenacaoAtual((estadoAnterior) => {
            if (estadoAnterior.colunaAtiva === colunaClicada) {
                return {
                    colunaAtiva: colunaClicada,
                    direcao: estadoAnterior.direcao === 'asc' ? 'desc' : 'asc',
                }
            }
            return {
                colunaAtiva: colunaClicada,
                direcao: 'asc',
            }
        })
    }

    const artistasFiltradosEOrdenados = useMemo<IArtista[]>(() => {
        const buscaGeral = termoBuscaGeral.trim().toLowerCase()
        const buscaGeralDigitos = extrairApenasNumeros(termoBuscaGeral)

        const filtrados = listaArtistas.filter((item) => {
            if (buscaGeral) {
                const telefoneApenasDigitos = extrairApenasNumeros(item.telefone)
                const textoCompletoLinha = [
                    item.nome_artista,
                    item.nome_social,
                    item.email,
                    item.telefone,
                    String(item.quantidade_eventos),
                ]
                    .join(' ')
                    .toLowerCase()

                const bateTexto = textoCompletoLinha.includes(buscaGeral)
                const bateTelefoneNumerico =
                    buscaGeralDigitos.length > 0 &&
                    telefoneApenasDigitos.includes(buscaGeralDigitos)

                if (!bateTexto && !bateTelefoneNumerico) {
                    return false
                }
            }

            const temCheckNome = filtrosColuna.nomesArtistasSelecionados.length > 0
            const textoNome = filtrosColuna.textoNomeArtista.trim().toLowerCase()
            if (temCheckNome || textoNome) {
                const bateSelecionados =
                    temCheckNome &&
                    filtrosColuna.nomesArtistasSelecionados.includes(item.nome_artista)
                const bateDigitado =
                    !temCheckNome &&
                    textoNome !== '' &&
                    item.nome_artista.toLowerCase().includes(textoNome)

                if (!bateSelecionados && !bateDigitado) return false
            }

            const temCheckSocial = filtrosColuna.nomesSociaisSelecionados.length > 0
            const textoSocial = filtrosColuna.textoNomeSocial.trim().toLowerCase()
            if (temCheckSocial || textoSocial) {
                const bateSelecionados =
                    temCheckSocial &&
                    filtrosColuna.nomesSociaisSelecionados.includes(item.nome_social)
                const bateDigitado =
                    !temCheckSocial &&
                    textoSocial !== '' &&
                    item.nome_social.toLowerCase().includes(textoSocial)

                if (!bateSelecionados && !bateDigitado) return false
            }

            const temCheckEmail = filtrosColuna.emailsSelecionados.length > 0
            const textoEmail = filtrosColuna.textoEmail.trim().toLowerCase()
            if (temCheckEmail || textoEmail) {
                const bateSelecionados =
                    temCheckEmail &&
                    filtrosColuna.emailsSelecionados.includes(item.email)
                const bateDigitado =
                    !temCheckEmail &&
                    textoEmail !== '' &&
                    item.email.toLowerCase().includes(textoEmail)

                if (!bateSelecionados && !bateDigitado) return false
            }

            const temCheckTelefone = filtrosColuna.telefonesSelecionados.length > 0
            const digitosTelefoneFiltro = filtrosColuna.textoTelefoneNumeros.trim()
            if (temCheckTelefone || digitosTelefoneFiltro) {
                const telefoneItemDigitos = extrairApenasNumeros(item.telefone)
                const bateSelecionados =
                    temCheckTelefone &&
                    filtrosColuna.telefonesSelecionados.includes(item.telefone)
                const bateDigitado =
                    !temCheckTelefone &&
                    digitosTelefoneFiltro !== '' &&
                    telefoneItemDigitos.includes(digitosTelefoneFiltro)

                if (!bateSelecionados && !bateDigitado) return false
            }

            const temCheckQtd =
                filtrosColuna.quantidadesEventosSelecionadas.length > 0
            const textoQtd = filtrosColuna.textoQuantidadeEventos.trim()
            if (temCheckQtd || textoQtd) {
                const qtdItemStr = String(item.quantidade_eventos)
                const bateSelecionados =
                    temCheckQtd &&
                    filtrosColuna.quantidadesEventosSelecionadas.includes(qtdItemStr)
                const bateDigitado =
                    !temCheckQtd && textoQtd !== '' && qtdItemStr === textoQtd

                if (!bateSelecionados && !bateDigitado) return false
            }

            return true
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
    }, [listaArtistas, termoBuscaGeral, filtrosColuna, ordenacaoAtual])

    const abrirModalCriacao = () => {
        setArtistaEmEdicao(null)
        setModalLateralAberto(true)
    }

    const abrirModalEdicao = (artista: IArtista) => {
        setArtistaEmEdicao(artista)
        setModalLateralAberto(true)
    }

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

    const manipularConfirmarExclusao = (idArtista: number) => {
        setListaArtistas((listaAnterior) =>
            listaAnterior.filter((item) => item.id !== idArtista)
        )
        setArtistaParaExcluir(null)
    }

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

    const exportarParaPdf = () => {
        window.print()
    }

    return (
        <div id="area-impressao-artistas" className="space-y-2.5">
            <header className="hidden print:block pb-2 border-b border-slate-200">
                <h1 className="text-base font-bold text-slate-900">
                    Lista de Artistas — SarsPlanner
                </h1>
                <p className="text-[11px] text-slate-500">
                    Relatório de artistas e apresentadores (
                    {artistasFiltradosEOrdenados.length} registros)
                </p>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] print:hidden">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={termoBuscaGeral}
                        onChange={(e) => setTermoBuscaGeral(e.target.value)}
                        placeholder="Busca geral na grid (nome, sigla, e-mail, telefone ou qtd)..."
                        className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50/60 pl-8 pr-2.5 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[#1056f5] focus:bg-white focus:outline-none transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    <div className="hidden xl:flex items-center gap-2 text-[10.5px] text-slate-500 mr-1">
                        <span>
                            Total:{' '}
                            <strong className="text-slate-700">
                                {artistasFiltradosEOrdenados.length}
                            </strong>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={limparTodosOsFiltros}
                        title="Limpar busca geral e filtros das colunas"
                        className="h-8 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-2.5 text-[11px] font-semibold transition cursor-pointer"
                    >
                        <FilterX className="w-3 h-3 text-slate-400" />
                        <span>Limpar</span>
                        {quantidadeFiltrosAtivos > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1056f5] text-[9.5px] font-bold">
                                {quantidadeFiltrosAtivos}
                            </span>
                        )}
                    </button>

                    <Botao
                        type="button"
                        variante="primario"
                        larguraTotal={false}
                        iconeEsquerda={<Plus className="w-3.5 h-3.5" />}
                        onClick={abrirModalCriacao}
                        className="h-8 text-[11px] py-1 px-3 rounded-lg"
                    >
                        Criar Artista/Apresentador
                    </Botao>

                    <div ref={menuOpcoesRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpcoesAberto((aberto) => !aberto)}
                            title="Mais opções e exportação"
                            aria-label="Mais opções e exportação"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {menuOpcoesAberto && (
                            <div className="absolute right-0 top-9 z-40 w-40 rounded-xl bg-white shadow-lg border border-slate-200 py-1">
                                <div className="px-3 py-1 border-b border-slate-100">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                                        Exportar Dados
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpcoesAberto(false)
                                        exportarParaPlanilhaCsv()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Exportar CSV</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpcoesAberto(false)
                                        exportarParaPdf()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                    <span>Exportar PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TabelaArtistas
                listaArtistas={artistasFiltradosEOrdenados}
                opcoesColunas={opcoesUnicasColunas}
                filtrosColuna={filtrosColuna}
                ordenacaoAtual={ordenacaoAtual}
                aoAlterarFiltroColuna={atualizarFiltroColuna}
                aoLimparColunaEspecifica={limparColunaEspecifica}
                aoAlternarOrdenacao={manipularAlternanciaOrdenacao}
                aoClicarEditar={abrirModalEdicao}
                aoClicarExcluir={(artista) => setArtistaParaExcluir(artista)}
            />

            <ModalLateralArtista
                aberto={modalLateralAberto}
                artistaEmEdicao={artistaEmEdicao}
                aoFechar={() => {
                    setModalLateralAberto(false)
                    setArtistaEmEdicao(null)
                }}
                aoSalvar={manipularSalvarArtista}
            />

            <ModalConfirmarExclusaoArtista
                artistaParaExcluir={artistaParaExcluir}
                aoCancelar={() => setArtistaParaExcluir(null)}
                aoConfirmar={manipularConfirmarExclusao}
            />
        </div>
    )
}
