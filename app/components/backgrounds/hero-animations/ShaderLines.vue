<template>
    <div
        ref="containerRef"
        :style="{ position: 'relative', width, height, overflow: 'hidden' }"
    >
        <canvas
            ref="canvasRef"
            :style="{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                zIndex: 1,
            }"
        />
        <div
            v-if="overlayClass"
            :class="['absolute', 'inset-0', 'z-1', overlayClass]"
        />

        <!-- Top / bottom diffuse gradients -->
        <div
            :class="[
                'absolute',
                'inset-x-0',
                'top-0',
                'z-2',
                'h-24',
                'pointer-events-none',
                'bg-linear-to-b',
                'from-background-surface',
                'to-transparent',
            ]"
        />
        <div
            :class="[
                'absolute',
                'inset-x-0',
                'bottom-0',
                'z-2',
                'h-24',
                'pointer-events-none',
                'bg-linear-to-t',
                'from-background-surface',
                'to-transparent',
            ]"
        />
    </div>
</template>

<script setup lang="ts">
// Imports
import * as THREE from 'three'

// Props
const props = defineProps({
    width: { type: String as PropType<string>, default: '100%' },
    height: { type: String as PropType<string>, default: '100%' },
    speed: { type: Number as PropType<number>, default: 0.05 },
    mosaic: {
        type: String as PropType<ShaderMosaic>,
        default: ShaderMosaic.BLOCKS,
        validator: (value: ShaderMosaic) => Object.values(ShaderMosaic).includes(value),
    },
    colorScheme: {
        type: String as PropType<ShaderColorScheme>,
        default: ShaderColorScheme.DEFAULT,
        validator: (value: ShaderColorScheme) => Object.values(ShaderColorScheme).includes(value),
    },
    overlayClass: { type: String as PropType<string>, default: '' },
})

// States
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// Stores
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// Color scheme resolution
const hexToVec3 = (hex: string): [number, number, number] => {
    const cleaned = hex.replace('#', '')
    return [
        parseInt(cleaned.substring(0, 2), 16) / 255,
        parseInt(cleaned.substring(2, 4), 16) / 255,
        parseInt(cleaned.substring(4, 6), 16) / 255,
    ]
}

const resolveCssVariable = (variableName: string): string => {
    if (!import.meta.client) return '#000000'
    const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    if (raw.startsWith('#')) return raw
    if (raw.startsWith('var(')) {
        const innerVariable = raw.slice(4, -1).trim()
        return resolveCssVariable(innerVariable)
    }
    return raw || '#000000'
}

const colorSchemeMap: Record<ShaderColorScheme, { primary: string; secondary: string; accent: string }> = {
    [ShaderColorScheme.DEFAULT]: {
        primary: '#454fff',
        secondary: '#2b25ff',
        accent: '#687cff',
    },
    [ShaderColorScheme.PRIMARY_BRAND]: {
        primary: '--color-theme-primary-brand-500',
        secondary: '--color-theme-primary-brand-700',
        accent: '--color-theme-primary-brand-300',
    },
    [ShaderColorScheme.SECONDARY_BRAND]: {
        primary: '--color-theme-secondary-brand-500',
        secondary: '--color-theme-secondary-brand-700',
        accent: '--color-theme-secondary-brand-300',
    },
    [ShaderColorScheme.BRAND_BLEND]: {
        primary: '--color-theme-primary-brand-500',
        secondary: '--color-theme-secondary-brand-500',
        accent: '--color-theme-primary-brand-300',
    },
    [ShaderColorScheme.AMBER]: {
        primary: '--amber-500',
        secondary: '--amber-700',
        accent: '--amber-300',
    },
    [ShaderColorScheme.EMERALD]: {
        primary: '--emerald-500',
        secondary: '--emerald-700',
        accent: '--emerald-300',
    },
    [ShaderColorScheme.CORAL]: {
        primary: '--coral-red-500',
        secondary: '--coral-red-700',
        accent: '--coral-red-300',
    },
    [ShaderColorScheme.PURPLE]: {
        primary: '--purple-heart-500',
        secondary: '--purple-heart-700',
        accent: '--purple-heart-300',
    },
}

const resolveSchemeColors = (
    scheme: ShaderColorScheme,
): { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number] } => {
    const config = colorSchemeMap[scheme]
    const resolve = (value: string) => (value.startsWith('--') ? hexToVec3(resolveCssVariable(value)) : hexToVec3(value))
    return {
        primary: resolve(config.primary),
        secondary: resolve(config.secondary),
        accent: resolve(config.accent),
    }
}

// Shaders
const vertexShader = `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
`

// Mosaic configurations for different styles
const mosaicConfigs = {
    [ShaderMosaic.BLOCKS]: { scaleX: 4, scaleY: 2, screenSize: 256, lineWidth: 0.0008, iterations: 5 },
    [ShaderMosaic.FINE]: { scaleX: 2, scaleY: 1, screenSize: 512, lineWidth: 0.0006, iterations: 6 },
    [ShaderMosaic.COARSE]: { scaleX: 8, scaleY: 4, screenSize: 128, lineWidth: 0.0012, iterations: 4 },
    [ShaderMosaic.STRIPS]: { scaleX: 1, scaleY: 16, screenSize: 256, lineWidth: 0.001, iterations: 5 },
    [ShaderMosaic.RADIAL]: { scaleX: 4, scaleY: 4, screenSize: 256, lineWidth: 0.0008, iterations: 5 },
}

const buildFragmentShader = (mosaic: ShaderMosaic, colorScheme: ShaderColorScheme) => {
    const config = mosaicConfigs[mosaic]

    const radialQuantization = `
            float angle = atan(uv.y, uv.x);
            float radius = length(uv);
            float sectors = 24.0;
            angle = floor(angle * sectors / TWO_PI) / (sectors / TWO_PI);
            float rings = 32.0;
            radius = floor(radius * rings) / rings;
            uv = vec2(cos(angle) * radius, sin(angle) * radius);
    `

    const gridQuantization = `
            vec2 fMosaicScal = vec2(${config.scaleX.toFixed(1)}, ${config.scaleY.toFixed(1)});
            vec2 vScreenSize = vec2(${config.screenSize.toFixed(1)}, ${config.screenSize.toFixed(1)});
            uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
            uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);
    `

    const quantizationBlock = mosaic === ShaderMosaic.RADIAL ? radialQuantization : gridQuantization

    return `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        ${
            colorScheme === ShaderColorScheme.DEFAULT
                ? 'uniform float uIsDark;'
                : `
        uniform vec3 uColorPrimary;
        uniform vec3 uColorSecondary;
        uniform vec3 uColorAccent;
        `
        }

        float random(in float x) {
            return fract(sin(x) * 1e4);
        }

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main(void) {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

            ${quantizationBlock}

            float t = time * 0.06 + random(uv.x) * 0.4;
            float lineWidth = ${config.lineWidth.toFixed(4)};

            vec3 color = vec3(0.0);
            for (int j = 0; j < 3; j++) {
                for (int i = 0; i < ${config.iterations}; i++) {
                    color[j] += lineWidth * float(i * i)
                        / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 1.0 - length(uv));
                }
            }

            ${
                colorScheme === ShaderColorScheme.DEFAULT
                    ? `vec3 rawColor = vec3(color[2], color[1], color[0]);
            vec3 finalColor = mix(
                vec3(1.0) - rawColor * 0.6,
                rawColor,
                uIsDark
            );`
                    : `vec3 finalColor = uColorPrimary * color[2]
                + uColorSecondary * color[1]
                + uColorAccent * color[0];`
            }

            float alpha = clamp(max(finalColor.r, max(finalColor.g, finalColor.b)), 0.0, 1.0);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
}

let animationId: number | null = null
let resizeHandler: (() => void) | null = null

onMounted(() => {
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const container = containerRef.value
    const isDefaultScheme = props.colorScheme === ShaderColorScheme.DEFAULT
    const schemeColors = !isDefaultScheme ? resolveSchemeColors(props.colorScheme) : null

    const uniforms = {
        time: { type: 'f', value: 1 },
        resolution: { type: 'v2', value: new THREE.Vector2() },
        ...(isDefaultScheme
            ? { uIsDark: { type: 'f', value: isDark.value ? 1 : 0 } }
            : {
                  uColorPrimary: { type: 'v3', value: new THREE.Vector3(...schemeColors!.primary) },
                  uColorSecondary: { type: 'v3', value: new THREE.Vector3(...schemeColors!.secondary) },
                  uColorAccent: { type: 'v3', value: new THREE.Vector3(...schemeColors!.accent) },
              }),
    }

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader: buildFragmentShader(props.mosaic, props.colorScheme),
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value!,
        antialias: false,
        alpha: true,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const resize = () => {
        const currentContainer = containerRef.value
        if (!currentContainer) return
        const containerWidth = currentContainer.clientWidth
        const containerHeight = currentContainer.clientHeight
        renderer.setSize(containerWidth, containerHeight, false)
        uniforms.resolution.value.x = renderer.domElement.width
        uniforms.resolution.value.y = renderer.domElement.height
    }

    resize()

    const renderLoop = () => {
        animationId = requestAnimationFrame(renderLoop)
        uniforms.time.value += props.speed
        renderer.render(scene, camera)
    }

    renderLoop()

    resizeHandler = resize
    window.addEventListener('resize', resizeHandler)
    const resizeObserver = new ResizeObserver(resize)
    if (container) resizeObserver.observe(container)

    onUnmounted(() => resizeObserver.disconnect())

    watch(isDark, (dark) => {
        if (isDefaultScheme) {
            ;(uniforms as { uIsDark: { value: number } }).uIsDark.value = dark ? 1 : 0
        } else {
            const updatedColors = resolveSchemeColors(props.colorScheme)
            const typedUniforms = uniforms as {
                uColorPrimary: { value: THREE.Vector3 }
                uColorSecondary: { value: THREE.Vector3 }
                uColorAccent: { value: THREE.Vector3 }
            }
            typedUniforms.uColorPrimary.value.set(...updatedColors.primary)
            typedUniforms.uColorSecondary.value.set(...updatedColors.secondary)
            typedUniforms.uColorAccent.value.set(...updatedColors.accent)
        }
    })
})

onUnmounted(() => {
    if (animationId) cancelAnimationFrame(animationId)
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>
