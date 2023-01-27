import vert from './plasma.vert?raw'
import frag from './plasma.frag?raw'
import { Suspense, useEffect, useMemo, useRef } from 'react'

import { PerspectiveCamera, Stats, useAspect } from '@react-three/drei'

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

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
			},
			uRes: {
				value: [512, 512],
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
		}),
		[]
	)

	const controls = {
		Scale: {
			min: 2,
			max: 50,
			step: 1,
			value: 8,
		},
		Ratios: folder({
			R1: {
				value: 80,
				min: 10,
				max: 120,
				step: 1,
			},
			R2: {
				value: 98,
				min: 10,
				max: 120,
				step: 1,
			},
			R3: {
				value: 14,
				min: 10,
				max: 120,
				step: 1,
			},
		}),
		FX: folder({
			DOF: true,
			Scanline: false,
			Noise: true,
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
				<sphereGeometry args={[1, 32, 16]} />
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
						focusDistance={4}
						focalLength={0.2}
						bokehScale={2}
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
				{plasmaData.Noise ? <Noise opacity={0.7} /> : <></>}
				{plasmaData.Sepia ? <Sepia opacity={1} /> : <></>}
			</EffectComposer>
		</Suspense>
	)
}

export default Scene
