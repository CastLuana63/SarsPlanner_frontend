import React from 'react'

/**
 * Classes padronizadas para todas as Grids e Tabelas Virtualizadas do SarsPlanner
 */
export const ESTILOS_PADRAO_GRID = {
    // Container externo da Grid preenchendo a altura restante da tela
    containerCartao:
        'bg-white rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col',

    // Área com altura fixa até completar a tela antes de precisar de scroll vertical
    viewportAlturaFixa:
        'relative overflow-y-auto select-none h-[calc(100vh-12.5rem)] min-h-[380px] bg-white',

    // Cabeçalho das Colunas em Azul com texto branco nítido
    cabecalhoColunasAzul:
        'sticky top-0 z-30 h-8 bg-[#1056f5] text-white border-b border-blue-700 text-[11px] font-bold uppercase tracking-wider select-none shadow-2xs',

    // Botão interativo dentro do cabeçalho azul (normal vs. com filtro ativo)
    botaoColunaInativo:
        'hover:bg-white/15 text-white',
    botaoColunaAtivo:
        'bg-white text-[#1056f5] shadow-2xs font-extrabold',

    // Linha que acopla os registros por Mês/Ano em Cinza Claro
    linhaGrupoMesCinzaClaro:
        'flex items-center justify-between px-3 bg-slate-100 hover:bg-slate-200/70 border-b border-slate-200 cursor-pointer transition-colors text-slate-700',

    // Linha de dados padrão
    linhaDadosBase:
        'items-center px-2 text-[10.5px] leading-none bg-white hover:bg-blue-50/35 text-slate-600 transition-colors',
} as const

export const obterClasseBotaoColunaAzul = (ativo: boolean): string => {
    return `inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${ativo
            ? ESTILOS_PADRAO_GRID.botaoColunaAtivo
            : ESTILOS_PADRAO_GRID.botaoColunaInativo
        }`
}

interface IContainerGridPadraoProps {
    children: React.ReactNode
    larguraMinimaPx?: string
}

export const ContainerGridPadrao: React.FC<IContainerGridPadraoProps> = ({
    children,
    larguraMinimaPx = 'min-w-[840px]',
}) => {
    return (
        <div className={ESTILOS_PADRAO_GRID.containerCartao}>
            <div className="overflow-x-auto flex-1 flex flex-col">
                <div className={`${larguraMinimaPx} flex-1 flex flex-col`}>
                    {children}
                </div>
            </div>
        </div>
    )
}
