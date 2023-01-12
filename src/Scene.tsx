import vert from './plasma.vert?raw'
import frag from './plasma.frag?raw'
import { Suspense, useMemo, useRef } from 'react'

import { PerspectiveCamera, Stats, useAspect } from '@react-three/drei'

import { useControls, folder } from 'leva'

import { BlendFunction } from 'postprocessing'
import { DepthOfField, EffectComposer, Noise, Scanline } from '@react-three/postprocessing'
import { ShaderMaterial } from 'three'
extend({ ShaderMaterial })
import { extend, useFrame, useThree } from '@react-three/fiber'

const Scene = () => {
	const sphereMaterialRef = useRef<ShaderMaterial>(null!)
	const planeMaterialRef = useRef<ShaderMaterial>(null!)

	const { viewport, gl } = useThree()

	const scale = useAspect(viewport.width, viewport.height)

	const uAspectRatio = scale[0] / scale[1]

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
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
				value: [20 / 100, 120 / 100, 19 / 100]
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
			value: 12,
		},
		Ratios: folder({
			R1: {
				value: 10,
				min: 10,
				max: 120,
				step: 1,
			},
			R2: {
				value: 111,
				min: 10,
				max: 120,
				step: 1,
			},
			R3: {
				value: 47,
				min: 10,
				max: 120,
				step: 1,
			},
		}),
		FX: folder({
			DOF: true,
			Scanline: false,
			Noise: true
		})
	}

	const plasmaData = useControls(controls)

	useFrame((state) => {
		const { clock } = state
		if (sphereMaterialRef.current) {
			const sphereMaterial = sphereMaterialRef.current
			sphereMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
			sphereMaterial.uniforms.uAspectRatio.value = uAspectRatio
			sphereMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
			sphereMaterial.uniforms.uR.value = [plasmaData.R1 / 100, plasmaData.R2 / 100, plasmaData.R3 / 100]
			sphereMaterial.uniforms.uFlip.value = 1.0
		}
		if (planeMaterialRef.current) {
			const planeMaterial = planeMaterialRef.current
			planeMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
			planeMaterial.uniforms.uAspectRatio.value = uAspectRatio
			planeMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
			planeMaterial.uniforms.uR.value = [plasmaData.R1 / 100, plasmaData.R2 / 100, plasmaData.R3 / 100]
			planeMaterial.uniforms.uFlip.value = 1.0
		}

	})

	return (
		<Suspense fallback={'loading...'}>
			<Stats />
			<PerspectiveCamera makeDefault position={[0, 0, 5]} />
			<mesh scale={1.5}>
				<sphereGeometry args={[1, 128, 64]} />
				<shaderMaterial ref={sphereMaterialRef} uniforms={uniforms} fragmentShader={frag} vertexShader={vert} />
			</mesh>
			<mesh scale={scale}>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial ref={planeMaterialRef} uniforms={uniforms} fragmentShader={frag} vertexShader={vert} />
			</mesh>
			<EffectComposer>
				{plasmaData.DOF ? <DepthOfField focusDistance={4} focalLength={0.2} bokehScale={2} height={1024} /> : <></>}
				{plasmaData.Scanline ? <Scanline
					blendFunction={BlendFunction.OVERLAY} // blend mode
					density={1.25} // scanline density
				/> : <></>}
				{plasmaData.Noise ? <Noise opacity={0.7} /> : <></>}
			</EffectComposer>
		</Suspense>

	)
}

export default Scene

