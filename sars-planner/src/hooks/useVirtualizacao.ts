import { useState, useMemo, useCallback, type UIEvent } from 'react'

interface IOpcoesVirtualizacao<T> {
    itens: T[]
    alturaContainerPx: number
    obterAlturaItemPx: (item: T, indice: number) => number
    overscan?: number
}

interface IItemVirtualRenderizado<T> {
    item: T
    indiceOriginal: number
    topoPx: number
    alturaPx: number
}

export function useVirtualizacao<T>({
    itens,
    alturaContainerPx,
    obterAlturaItemPx,
    overscan = 6,
}: IOpcoesVirtualizacao<T>) {
    const [scrollTop, setScrollTop] = useState<number>(0)

    const manipularScroll = useCallback((evento: UIEvent<HTMLDivElement>) => {
        setScrollTop(evento.currentTarget.scrollTop)
    }, [])

    const { alturaTotalPx, itensComPosicao } = useMemo(() => {
        let acumuladorTopo = 0
        const mapeados: IItemVirtualRenderizado<T>[] = itens.map((item, indice) => {
            const altura = obterAlturaItemPx(item, indice)
            const registro: IItemVirtualRenderizado<T> = {
                item,
                indiceOriginal: indice,
                topoPx: acumuladorTopo,
                alturaPx: altura,
            }
            acumuladorTopo += altura
            return registro
        })

        return {
            alturaTotalPx: acumuladorTopo,
            itensComPosicao: mapeados,
        }
    }, [itens, obterAlturaItemPx])

    const itensVisiveis = useMemo(() => {
        const limiteSuperior = scrollTop
        const limiteInferior = scrollTop + alturaContainerPx

        let indiceInicial = itensComPosicao.findIndex(
            (reg) => reg.topoPx + reg.alturaPx >= limiteSuperior
        )
        if (indiceInicial === -1) indiceInicial = 0

        let indiceFinal = itensComPosicao.findIndex(
            (reg) => reg.topoPx > limiteInferior
        )
        if (indiceFinal === -1) indiceFinal = itensComPosicao.length - 1

        const inicioComOverscan = Math.max(0, indiceInicial - overscan)
        const fimComOverscan = Math.min(
            itensComPosicao.length - 1,
            indiceFinal + overscan
        )

        return itensComPosicao.slice(inicioComOverscan, fimComOverscan + 1)
    }, [itensComPosicao, scrollTop, alturaContainerPx, overscan])

    return {
        alturaTotalPx,
        itensVisiveis,
        manipularScroll,
    }
}
