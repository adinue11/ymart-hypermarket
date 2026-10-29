// Floating Gallery — Originkit

"use client"

import * as React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { animate } from "framer-motion"

type Motion = {
    type?: "spring" | "tween" | "keyframes" | "inertia"
    duration?: number
    ease?: [number, number, number, number]
    delay?: number
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
    restSpeed?: number
    restDelta?: number
}

const DEFAULT_TRANSITION: Motion = {
    type: "tween",
    duration: 0.25,

    ease: [0, 0, 0.58, 1],
}

interface GalleryImage {
    src?: string
    link?: string
}

interface Props {
    /** Disable card activation when the gallery is decorative. */
    interactive?: boolean
    images?: GalleryImage[]
    background?: string
    cardWidth?: number
    cardHeight?: number
    rounded?: number
    speed?: number
    reach?: number
    fade?: number
    transition?: Motion
    style?: React.CSSProperties
}

const DEFAULT_CARD_W = 220
const DEFAULT_CARD_H = 280
const SIZE_MIN = 40
const SIZE_MAX = 800

const SPEED_REF = 40

const ZOOM = 1.6

const ZOOM_FIT = 0.9

type Particle = {
    x: number
    y: number

    dx: number
    dy: number

    z: number

    targetZ: number
    w: number
    h: number
    mult: number
}

function hash01(i: number): number {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
    return s - Math.floor(s)
}

const LAYOUT: ReadonlyArray<{
    w: number
    h: number
    x: number
    y: number
}> = [
    { w: 220, h: 280, x: 12, y: 10 },
    { w: 260, h: 200, x: 42, y: 35 },
    { w: 200, h: 260, x: 74, y: 8 },
    { w: 240, h: 240, x: 26, y: 62 },
    { w: 220, h: 300, x: 60, y: 74 },
    { w: 180, h: 220, x: 88, y: 48 },
]

const DUMMY_PAIRS: ReadonlyArray<[string, string]> = [
    ["FF7A45", "FFB199"],
    ["4D7CFE", "9BC1FF"],
    ["16C79A", "9BE7C4"],
    ["FFC53D", "FFE9A8"],
    ["B15CFF", "E0B8FF"],
    ["FF4D7E", "FFB3C7"],
]
const dummyImage = (i: number, w = 1200, h = 800) => {
    const [a, b] = DUMMY_PAIRS[i % DUMMY_PAIRS.length]
    const n = String(i + 1).padStart(2, "0")
    return (
        `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E` +
        `%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E` +
        `%3Cstop offset='0' stop-color='%23${a}'/%3E%3Cstop offset='1' stop-color='%23${b}'/%3E` +
        `%3C/linearGradient%3E%3C/defs%3E%3Crect width='${w}' height='${h}' fill='url(%23g)'/%3E` +
        `%3Ctext x='50%25' y='50%25' dy='.35em' text-anchor='middle' ` +
        `font-family='Inter, Helvetica, Arial, sans-serif' font-size='${Math.round(Math.min(w, h) * 0.34)}' ` +
        `font-weight='700' fill='rgba(255,255,255,0.9)'%3E${n}%3C/text%3E%3C/svg%3E`
    )

        .replace(/ /g, "%20")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
}

const DEFAULT_ITEMS: GalleryImage[] = LAYOUT.map((slot, i) => ({
    src: dummyImage(i, slot.w * 3, slot.h * 3),
}))

const DEFAULT_IMAGES: GalleryImage[] = DEFAULT_ITEMS

function roundedClip(w: number, h: number, pct: number): string {
    const t = Math.max(0, Math.min(100, pct)) / 100
    const short = Math.min(w, h)
    const insetX = (t * (w - short)) / 2
    const insetY = (t * (h - short)) / 2
    return `inset(${insetY}px ${insetX}px round ${(t * short) / 2}px)`
}

function __OriginkitBase_FloatingGallery(props: Props) {
    const {
        interactive = true,
        images = [{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27660%27%20height=%27840%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%23FF7A45%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%23FFB199%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27660%27%20height=%27840%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27224%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E01%3C/text%3E%3C/svg%3E"},{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27780%27%20height=%27600%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%234D7CFE%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%239BC1FF%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27780%27%20height=%27600%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27204%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E02%3C/text%3E%3C/svg%3E"},{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27600%27%20height=%27780%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%2316C79A%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%239BE7C4%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27600%27%20height=%27780%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27204%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E03%3C/text%3E%3C/svg%3E"},{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27720%27%20height=%27720%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%23FFC53D%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%23FFE9A8%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27720%27%20height=%27720%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27245%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E04%3C/text%3E%3C/svg%3E"},{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27660%27%20height=%27900%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%23B15CFF%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%23E0B8FF%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27660%27%20height=%27900%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27224%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E05%3C/text%3E%3C/svg%3E"},{"src":"data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27540%27%20height=%27660%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20y1=%270%27%20x2=%271%27%20y2=%271%27%3E%3Cstop%20offset=%270%27%20stop-color=%27%23FF4D7E%27/%3E%3Cstop%20offset=%271%27%20stop-color=%27%23FFB3C7%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27540%27%20height=%27660%27%20fill=%27url%28%23g%29%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dy=%27.35em%27%20text-anchor=%27middle%27%20font-family=%27Inter,%20Helvetica,%20Arial,%20sans-serif%27%20font-size=%27184%27%20font-weight=%27700%27%20fill=%27rgba%28255,255,255,0.9%29%27%3E06%3C/text%3E%3C/svg%3E"}],
        background = "#0b0b0d",
        cardWidth = 220,
        cardHeight = 280,
        rounded = 16,
        speed = 50,
        reach = 260,
        fade = 0,
        transition = {"ease":[0,0,0.58,1],"mass":1,"type":"tween","damping":60,"duration":0.25,"stiffness":800},
        style,
    } = props

    const slotSX = Math.max(1, cardWidth) / DEFAULT_CARD_W
    const slotSY = Math.max(1, cardHeight) / DEFAULT_CARD_H

    const rootRef = useRef<HTMLDivElement>(null)
    const partsRef = useRef<Particle[]>([])

    const nodesRef = useRef<Array<HTMLDivElement | null>>([])
    const sizeRef = useRef({ w: 0, h: 0 })
    const pointerRef = useRef({ x: 0, y: 0, active: false })
    const [zoomed, setZoomed] = useState<number | null>(null)

    const transitionRef = useRef(transition)
    transitionRef.current = transition

    const zoomAnims = useRef<Array<{ stop: () => void } | null>>([])

    const zoomedRef = useRef<number | null>(null)
    zoomedRef.current = zoomed

    const cfgRef = useRef({ speed, reach, fade })
    cfgRef.current = { speed, reach, fade }

    const itemsProp = images
    const items =
        itemsProp && itemsProp.length ? itemsProp : DEFAULT_IMAGES
    const count = items.length

    const seed = useCallback(() => {
        const { w: W, h: H } = sizeRef.current
        if (!W || !H) return
        partsRef.current = items.map((_im, i) => {
            const slot = LAYOUT[i % LAYOUT.length]
            const w = slot.w * slotSX
            const h = slot.h * slotSY
            const prev = partsRef.current[i]
            return {
                x: (slot.x / 100) * W - w / 2,

                y: prev ? prev.y : (slot.y / 100) * H - h / 2,
                dx: prev ? prev.dx : 0,
                dy: prev ? prev.dy : 0,
                z: prev ? prev.z : 0,
                targetZ: prev ? prev.targetZ : 0,
                w,
                h,

                mult: 0.65 + hash01(i) * 0.7,
            }
        })

    }, [count, slotSX, slotSY])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const measure = () => {
            sizeRef.current = { w: root.offsetWidth, h: root.offsetHeight }
            seed()
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(root)
        return () => ro.disconnect()
    }, [seed])

    useEffect(() => {
        let raf = 0
        let last = performance.now()

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick)

            const dt = Math.min(0.05, (now - last) / 1000)
            last = now

            const { w: W, h: H } = sizeRef.current
            if (!W || !H) return

            const cfg = cfgRef.current
            const R = Math.max(1, cfg.reach)

            const F = 0
            const drift = (Math.max(0, cfg.speed) / 50) * SPEED_REF

            const fadePx = (Math.max(0, Math.min(100, cfg.fade)) / 100) * (H / 2)
            const p = pointerRef.current
            const zi = zoomedRef.current

            const kOut = 1 - Math.exp(-8 * dt)

            for (let i = 0; i < partsRef.current.length; i++) {
                const a = partsRef.current[i]
                const node = nodesRef.current[i]
                if (!node) continue
                const frozen = zi === i

                if (!frozen) {
                    a.y += drift * a.mult * dt

                    const span = H + a.h
                    if (a.y > H) a.y -= span
                    else if (a.y < -a.h) a.y += span
                }

                let tx = 0
                let ty = 0
                if (p.active && !frozen && F > 0) {
                    const cx = a.x + a.w / 2
                    const cy = a.y + a.h / 2
                    let vx = cx - p.x
                    let vy = cy - p.y
                    const d = Math.hypot(vx, vy)
                    if (d < R) {
                        const inv = d > 0.001 ? 1 / d : 0
                        const fall = 1 - d / R

                        const push = F * fall * fall
                        tx = vx * inv * push
                        ty = vy * inv * push
                    }
                }
                a.dx += (tx - a.dx) * kOut
                a.dy += (ty - a.dy) * kOut

                const targetZ = frozen ? 1 : 0
                if (a.targetZ !== targetZ) {
                    a.targetZ = targetZ
                    zoomAnims.current[i]?.stop()
                    const from = a.z
                    const delta = targetZ - from
                    zoomAnims.current[i] = animate(0, 1, {
                        ...transitionRef.current,
                        onUpdate: (t: number) => {
                            a.z = from + delta * t
                        },
                        onComplete: () => {
                            zoomAnims.current[i] = null
                        },
                    })
                }

                const baseX = a.x + a.dx
                const baseY = a.y + a.dy
                const z = a.z
                const px = baseX + ((W - a.w) / 2 - baseX) * z
                const py = baseY + ((H - a.h) / 2 - baseY) * z

                const fit = Math.min(
                    ZOOM,
                    (W * ZOOM_FIT) / Math.max(1, a.w),
                    (H * ZOOM_FIT) / Math.max(1, a.h)
                )
                const s = 1 + (fit - 1) * z

                node.style.transform =
                    `translate3d(${px}px, ${py}px, 0) scale(${s})`

                node.style.zIndex = z > 0.001 ? "999" : "1"

                if (fadePx > 0) {
                    const cy = a.y + a.h / 2
                    const edge = Math.min(cy, H - cy)
                    const o = Math.max(0, Math.min(1, edge / fadePx))

                    node.style.opacity = `${o + (1 - o) * z}`
                } else {
                    node.style.opacity = "1"
                }
            }
        }

        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])

    const onPointerMove = (e: React.PointerEvent) => {
        const root = rootRef.current
        if (!root) return
        const r = root.getBoundingClientRect()

        const sx = r.width ? root.offsetWidth / r.width : 1
        const sy = r.height ? root.offsetHeight / r.height : 1
        pointerRef.current = {
            x: (e.clientX - r.left) * sx,
            y: (e.clientY - r.top) * sy,
            active: true,
        }
    }
    const onPointerLeave = () => {
        pointerRef.current.active = false
    }

    return (
        <div
            ref={rootRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}

            onClick={() => {
                if (interactive && zoomed !== null) setZoomed(null)
            }}
            style={{
                minWidth: 0,
                minHeight: 560,
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                background,
                isolation: "isolate",
                touchAction: "none",
                ...style,
            }}
        >
            {items.map((im, i) => {
                const slot = LAYOUT[i % LAYOUT.length]
                const w = slot.w * slotSX
                const h = slot.h * slotSY
                const isZoom = zoomed === i
                const link = im.link || ""

                const activate = (e?: React.SyntheticEvent) => {
                    e?.stopPropagation()
                    if (!interactive) return
                    if (isZoom && link) {
                        // Use same-tab navigation only for an explicitly configured URL.
                        window.location.assign(link)
                        return
                    }
                    if (zoomed !== null) {
                        setZoomed(null)
                        return
                    }
                    setZoomed(i)
                }
                return (
                    <div
                        key={i}
                        ref={(n) => {
                            nodesRef.current[i] = n
                        }}
                        onClick={interactive ? activate : undefined}
                        role={interactive ? "button" : "img"}
                        tabIndex={interactive ? 0 : -1}
                        aria-label={interactive ? `Gallery image ${i + 1}${isZoom ? ", enlarged" : ""}` : `About YMART gallery image ${i + 1}`}
                        aria-pressed={interactive ? isZoom : undefined}
                        onKeyDown={interactive ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                activate(e)
                            }
                        } : undefined}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: w,
                            height: h,

                            clipPath: roundedClip(w, h, rounded),
                            cursor: interactive ? "pointer" : "default",
                            userSelect: "none",
                            background: "rgba(255,255,255,0.06)",

                            filter: isZoom
                                ? "drop-shadow(0 30px 40px rgba(0,0,0,0.55))"
                                : "drop-shadow(0 10px 15px rgba(0,0,0,0.35))",
                            transition: "box-shadow 240ms ease",
                            willChange: "transform",
                        }}
                    >
                        {im.src ? (
                            <img
                                src={im.src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    pointerEvents: "none",
                                }}
                            />
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}

FloatingGallery.displayName = "Floating Gallery"

const __originkitPresetProps = {
  "transition": {
    "type": "tween",
    "stiffness": 800,
    "damping": 60,
    "mass": 1,
    "ease": [
      0,
      0,
      0.58,
      1
    ],
    "duration": 0.25
  }
};

export default function FloatingGallery(props: Record<string, unknown>) {
  return <__OriginkitBase_FloatingGallery {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}