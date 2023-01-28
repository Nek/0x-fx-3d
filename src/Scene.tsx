import vert from './plasma.vert?raw'
import frag from './plasma.frag?raw'
import { Suspense, useEffect, useMemo, useRef } from 'react'

import paletteUrl from "./palette.png"

import { PerspectiveCamera, Stats, useAspect, useTexture } from '@react-three/drei'

import { useControls, folder } from 'leva'

import { BlendFunction } from 'postprocessing'
import {
	DepthOfField,
	EffectComposer,
	Noise,
	Scanline,
	Sepia,
} from '@react-three/postprocessing'
import { ShaderMaterial } from 'three'
extend({ ShaderMaterial })
import { extend, useFrame, useThree } from '@react-three/fiber'

import { el } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'

const ctx = new AudioContext()
const core = new WebRenderer()

const Scene = () => {
	useEffect(() => {
		; (async () => {
			let node = await core.initialize(ctx, {
				numberOfInputs: 0,
				numberOfOutputs: 1,
				outputChannelCount: [2],
			})

			node.connect(ctx.destination)
			core.on('load', function () {
				// Before actually rendering anything we put a click handler on the button so that
				// this example doesn't start making noise automatically
				window.addEventListener('click', async function (e) {
					if (ctx.state === 'suspended') {
						await ctx.resume()
					}
					core.render(
						el.lowpass(
							el.add(200, el.mul(1000, el.mul(0.5, el.add(1, el.cycle(0.02))))),
							1.2,
							el.mul(0.1, el.noise())
						)
					)
				})
			})
		})()
	}, [])

	const sphereMaterialRef = useRef<ShaderMaterial>(null!)
	const planeMaterialRef = useRef<ShaderMaterial>(null!)

	const { viewport } = useThree()

	const scale = useAspect(viewport.width, viewport.height)

	const uAspectRatio = scale[0] / scale[1]

	const texture: THREE.Texture = useTexture(paletteUrl)

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
			},
			uDeltaTime: {
				value: 0.0,
			},
			uRes: {
				value: [256, 256],
			},
			uAspectRatio: {
				value: uAspectRatio,
			},
			uScale: {
				value: 12 / 100,
			},
			uR: {
				value: [20 / 100, 120 / 100, 19 / 100],
			},
			uFlip: { value: 1.0 },
			uColorTable: { value: texture },
		}),
		[]
	)

	const controls = {
		Scale: {
			min: 1,
			max: 50,
			step: 1,
			value: 50,
		},
		Ratios: folder({
			R1: {
				value: 90,
				min: 1,
				max: 241,
				step: 1,
			},
			R2: {
				value: 241,
				min: 1,
				max: 241,
				step: 1,
			},
			R3: {
				value: 220,
				min: 1,
				max: 241,
				step: 1,
			},
		}),
		FX: folder({
			DOF: false,
			Scanline: false,
			Noise: false,
			Sepia: false,
		}),
	}

	const plasmaData = useControls(controls)

	useFrame((state) => {
		const { clock } = state
		if (sphereMaterialRef.current) {
			const sphereMaterial = sphereMaterialRef.current
			sphereMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
			sphereMaterial.uniforms.uAspectRatio.value = uAspectRatio
			sphereMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
			sphereMaterial.uniforms.uR.value = [
				plasmaData.R1 / 100,
				plasmaData.R2 / 100,
				plasmaData.R3 / 100,
			]
			sphereMaterial.uniforms.uFlip.value = 1.0
			sphereMaterial.uniforms.uDeltaTime.value = clock.getDelta()
			// sphereMaterial.uniforms.uColorTable.value = texture
		}
		if (planeMaterialRef.current) {
			const planeMaterial = planeMaterialRef.current
			planeMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
			planeMaterial.uniforms.uAspectRatio.value = uAspectRatio
			planeMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
			planeMaterial.uniforms.uR.value = [
				plasmaData.R1 / 100,
				plasmaData.R2 / 100,
				plasmaData.R3 / 100,
			]
			planeMaterial.uniforms.uFlip.value = 1.0
		}
	})



	console.log(scale[0] / scale[1])

	const sphereScale =
		scale[0] / scale[1] <= 0.7
			? scale[0] / scale[1] * 1.7
			: 1.2

	return (
		<Suspense fallback={'loading...'}>
			<Stats />
			<PerspectiveCamera makeDefault position={[0, 0, 5]} />
			<mesh scale={sphereScale}>
				<sphereGeometry args={[1, 128, 64]} />
				<shaderMaterial
					ref={sphereMaterialRef}
					uniforms={uniforms}
					fragmentShader={frag}
					vertexShader={vert}
				/>
			</mesh>
			<mesh scale={scale}>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial
					ref={planeMaterialRef}
					uniforms={uniforms}
					fragmentShader={frag}
					vertexShader={vert}
				/>
			</mesh>
			<EffectComposer>
				{plasmaData.DOF ? (
					<DepthOfField
						focusDistance={5}
						focalLength={5}
						bokehScale={1}
						height={1024}
					/>
				) : (
					<></>
				)}
				{plasmaData.Scanline ? (
					<Scanline
						blendFunction={BlendFunction.OVERLAY} // blend mode
						density={1.25} // scanline density
					/>
				) : (
					<></>
				)}
				{plasmaData.Noise ? <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.8} /> : <></>}
				{plasmaData.Sepia ? <Sepia opacity={1} /> : <></>}
			</EffectComposer>
		</Suspense>
	)
}

export default Scene
