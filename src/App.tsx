import vert from './plasma.vert'
import frag from './plasma.frag'
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, useAspect } from '@react-three/drei'
import { DepthOfField, EffectComposer, Noise, Scanline } from '@react-three/postprocessing'
import { useControls, folder } from 'leva'
import { BlendFunction } from 'postprocessing'

const Scene = () => {
	const sphereMesh = useRef()
	const planeMesh = useRef()

	const { viewport } = useThree()

	const scale = useAspect(viewport.width, viewport.height)

	const uAspectRatio = scale[0] / scale[1];

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
			},
			uRes: {
				value: [1024, 1024],
			},
			uAspectRatio: {
				value: uAspectRatio,
			},
			uScale: {
				value: 4 / 100,
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
			value: 3,
		},
		'Ratios': folder({
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
			DOF: false,
			Scanline: false,
			Noise: false
		})
	}

	const plasmaData = useControls(controls)

	useFrame((state) => {
		const { clock } = state
		if (sphereMesh.current) {
			sphereMesh.current.material.uniforms.uTime.value = clock.getElapsedTime()
			sphereMesh.current.material.uniforms.uAspectRatio.value = uAspectRatio
			sphereMesh.current.material.uniforms.uScale.value = plasmaData.Scale / 1000
			sphereMesh.current.material.uniforms.uR.value = [plasmaData.R1 / 100, plasmaData.R2 / 100, plasmaData.R3 / 100]
			sphereMesh.current.material.uniforms.uFlip.value = 1.0
		}
		if (planeMesh.current) {
			planeMesh.current.material.uniforms.uTime.value = clock.getElapsedTime()
			planeMesh.current.material.uniforms.uAspectRatio.value = uAspectRatio
			planeMesh.current.material.uniforms.uScale.value = plasmaData.Scale / 1000
			planeMesh.current.material.uniforms.uR.value = [plasmaData.R1 / 100, plasmaData.R2 / 100, plasmaData.R3 / 100]
			planeMesh.current.material.uniforms.uFlip.value = 1.0

		}
	})

	return (
		<>
			<mesh ref={sphereMesh} scale={1.5}>
				<sphereGeometry args={[1, 128, 64]} />
				<shaderMaterial uniforms={uniforms} fragmentShader={frag} vertexShader={vert} />
			</mesh>
			<mesh ref={planeMesh} scale={scale}>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial uniforms={uniforms} fragmentShader={frag} vertexShader={vert} />
			</mesh>
			<EffectComposer>
				{plasmaData.DOF && <DepthOfField focusDistance={4} focalLength={0.2} bokehScale={2} height={1024} />}
				{/*<Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />*/}
					
				{/*<Vignette eskil={false} offset={0.1} darkness={1.1} />*/}
				{plasmaData.Scanline && <Scanline
					blendFunction={BlendFunction.OVERLAY} // blend mode
					density={1.25} // scanline density
				/>}
				{plasmaData.Noise && <Noise opacity={0.7} />}
			</EffectComposer>
		</>
	)
}

const App = () => {
	return (
		<Canvas>
			<PerspectiveCamera makeDefault position={[0, 0, 5]} />
			<Suspense fallback={'loading...'}>
				<Scene />
			</Suspense>
		</Canvas >
	)
}

export default App

