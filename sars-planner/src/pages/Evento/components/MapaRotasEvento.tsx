import React, { useEffect, useRef, useState } from 'react'
import { Navigation, RotateCcw } from 'lucide-react'
import type { IDistanciaCidadeEvento, IEvento } from '@/types/evento.types'

interface IMapaRotasEventoProps {
    eventoPrincipal: IEvento
    cidadesSecundarias: IDistanciaCidadeEvento[]
    cidadeRotaSelecionada: IDistanciaCidadeEvento | null
    aoSelecionarCidadeNoMapa: (cidade: IDistanciaCidadeEvento | null) => void
}

declare global {
    interface Window {
        L?: any
    }
}

export const MapaRotasEvento: React.FC<IMapaRotasEventoProps> = ({
    eventoPrincipal,
    cidadesSecundarias,
    cidadeRotaSelecionada,
    aoSelecionarCidadeNoMapa,
}) => {
    const containerMapaRef = useRef<HTMLDivElement>(null)
    const instanciaMapaRef = useRef<any>(null)
    const camadaMarcadoresRef = useRef<any>(null)
    const camadaRotaRef = useRef<any>(null)
    const [leafletPronto, setLeafletPronto] = useState<boolean>(
        Boolean(window.L)
    )

    useEffect(() => {
        if (window.L) {
            setLeafletPronto(true)
            return
        }

        if (!document.getElementById('leaflet-css-cdn')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css-cdn'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        const scriptExistente = document.getElementById('leaflet-js-cdn')
        if (scriptExistente) {
            scriptExistente.addEventListener('load', () => setLeafletPronto(true))
            return
        }

        const script = document.createElement('script')
        script.id = 'leaflet-js-cdn'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => setLeafletPronto(true)
        document.body.appendChild(script)
    }, [])

    useEffect(() => {
        if (!leafletPronto || !containerMapaRef.current || instanciaMapaRef.current)
            return

        const L = window.L
        const mapa = L.map(containerMapaRef.current, {
            center: [eventoPrincipal.latitude, eventoPrincipal.longitude],
            zoom: 5,
            zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18,
        }).addTo(mapa)

        camadaMarcadoresRef.current = L.layerGroup().addTo(mapa)
        camadaRotaRef.current = L.layerGroup().addTo(mapa)
        instanciaMapaRef.current = mapa

        return () => {
            mapa.remove()
            instanciaMapaRef.current = null
        }
    }, [leafletPronto])

    useEffect(() => {
        if (!leafletPronto || !instanciaMapaRef.current) return

        const L = window.L
        const mapa = instanciaMapaRef.current
        const grupoMarcadores = camadaMarcadoresRef.current
        const grupoRota = camadaRotaRef.current

        grupoMarcadores.clearLayers()
        grupoRota.clearLayers()

        const iconeVerdePrincipal = L.divIcon({
            className: '',
            html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#10b981;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);color:#fff;font-weight:800;font-size:11px;">★</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        })

        const marcadorPrincipal = L.marker(
            [eventoPrincipal.latitude, eventoPrincipal.longitude],
            { icon: iconeVerdePrincipal }
        ).bindPopup(
            `<div style="font-size:11px;"><strong>CIDADE PRINCIPAL (DESTINO)</strong><br/>${eventoPrincipal.cidade_uf}<br/>Artista: ${eventoPrincipal.artista}</div>`
        )
        grupoMarcadores.addLayer(marcadorPrincipal)

        const pontosParaEnquadrar: [number, number][] = [
            [eventoPrincipal.latitude, eventoPrincipal.longitude],
        ]

        cidadesSecundarias.forEach((cid) => {
            const estaSelecionada =
                cidadeRotaSelecionada?.eventoId === cid.eventoId

            const iconeVermelho = L.divIcon({
                className: '',
                html: `<div style="display:flex;align-items:center;justify-content:center;width:${estaSelecionada ? '26px' : '22px'
                    };height:${estaSelecionada ? '26px' : '22px'
                    };border-radius:9999px;background:#ef4444;border:3px solid ${estaSelecionada ? '#1056f5' : '#ffffff'
                    };box-shadow:0 2px 8px rgba(0,0,0,0.3);color:#fff;font-weight:700;font-size:9px;cursor:pointer;">●</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            })

            const marcadorSecundario = L.marker([cid.latitude, cid.longitude], {
                icon: iconeVermelho,
            })
                .bindPopup(
                    `<div style="font-size:11px;"><strong>${cid.cidade_uf}</strong><br/>Distância: <b>${cid.distanciaKm} km</b><br/>Tempo: <b>${cid.tempoEstimadoTexto}</b></div>`
                )
                .on('click', () => {
                    aoSelecionarCidadeNoMapa(cid)
                })

            grupoMarcadores.addLayer(marcadorSecundario)

            if (!cidadeRotaSelecionada || estaSelecionada) {
                pontosParaEnquadrar.push([cid.latitude, cid.longitude])
            }
        })

        // Se houver UMA cidade selecionada, traça a rota mais rápida até a Cidade Principal (cidade do evento)
        if (cidadeRotaSelecionada) {
            const origem = cidadeRotaSelecionada
            const destino = eventoPrincipal

            const urlOsrm = `https://router.project-osrm.org/route/v1/driving/${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}?overview=full&geometries=geojson`

            fetch(urlOsrm)
                .then((res) => res.json())
                .then((dados) => {
                    if (!instanciaMapaRef.current) return
                    grupoRota.clearLayers()

                    if (dados?.routes?.[0]?.geometry?.coordinates) {
                        const coordsLatLng = dados.routes[0].geometry.coordinates.map(
                            (c: [number, number]) => [c[1], c[0]]
                        )
                        const polilinhaReal = L.polyline(coordsLatLng, {
                            color: '#1056f5',
                            weight: 4,
                            opacity: 0.9,
                        })
                        grupoRota.addLayer(polilinhaReal)
                        mapa.fitBounds(polilinhaReal.getBounds(), { padding: [45, 45] })
                    } else {
                        throw new Error('Fallback linha direta')
                    }
                })
                .catch(() => {
                    if (!instanciaMapaRef.current) return
                    grupoRota.clearLayers()
                    const linhaDireta = L.polyline(
                        [
                            [origem.latitude, origem.longitude],
                            [destino.latitude, destino.longitude],
                        ],
                        {
                            color: '#1056f5',
                            weight: 3.5,
                            dashArray: '8, 6',
                        }
                    )
                    grupoRota.addLayer(linhaDireta)
                    mapa.fitBounds(linhaDireta.getBounds(), { padding: [50, 50] })
                })
        } else if (pontosParaEnquadrar.length > 1) {
            mapa.fitBounds(L.latLngBounds(pontosParaEnquadrar), {
                padding: [40, 40],
            })
        } else {
            mapa.setView([eventoPrincipal.latitude, eventoPrincipal.longitude], 7)
        }
    }, [
        leafletPronto,
        eventoPrincipal,
        cidadesSecundarias,
        cidadeRotaSelecionada,
    ])

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] overflow-hidden flex flex-col h-[410px]">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-[#1056f5]" />
                    <span className="text-xs font-bold text-slate-800">
                        Trajetórias até {eventoPrincipal.cidade_uf}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-[10.5px] font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Principal
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        Demais Cidades ({cidadesSecundarias.length})
                    </span>

                    {cidadeRotaSelecionada && (
                        <button
                            type="button"
                            onClick={() => aoSelecionarCidadeNoMapa(null)}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#1056f5] hover:bg-blue-100 cursor-pointer"
                        >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Ver todas sem linha</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative flex-1 w-full bg-slate-100">
                <div ref={containerMapaRef} className="w-full h-full z-10" />

                {cidadeRotaSelecionada && (
                    <div className="absolute bottom-3 left-3 z-20 rounded-xl bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-2 shadow-lg border border-slate-700 text-[11px] flex items-center gap-3">
                        <div>
                            <span className="text-[9.5px] uppercase tracking-wider text-blue-300 font-bold block">
                                Rota Mais Rápida Selecionada
                            </span>
                            <strong>{cidadeRotaSelecionada.cidade_uf}</strong> →{' '}
                            <strong className="text-emerald-400">
                                {eventoPrincipal.cidade_uf}
                            </strong>
                        </div>
                        <div className="border-l border-slate-700 pl-3 text-right">
                            <span className="font-extrabold text-xs text-amber-300 block">
                                {cidadeRotaSelecionada.distanciaKm} km
                            </span>
                            <span className="text-[10px] text-slate-300">
                                ~ {cidadeRotaSelecionada.tempoEstimadoTexto}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
