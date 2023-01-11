import vert from './plasma.vert'
import frag from './plasma.frag'
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { DoubleSide, FrontSide, Vector2 } from 'three'
import { PerspectiveCamera, useAspect } from '@react-three/drei'

const Scene = () => {
	const mesh = useRef()

	const { viewport } = useThree()

	const scale = useAspect(viewport.width, viewport.height)

	const uAspectRatio = scale[0] / scale[1];

	useFrame((state) => {
		const { clock } = state
		if (mesh.current) {
			mesh.current.material.uniforms.uTime.value = clock.getElapsedTime()
			mesh.current.material.uniforms.uAspectRatio.value = uAspectRatio
		}
	})

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
			},
			uRes: {
				value: new Vector2(1024, 1024),
			},
			uAspectRatio: {
				value: uAspectRatio,
			}
		}),
		[]
	)

	return (
		<>
			<mesh ref={mesh}>
				<sphereGeometry args={[1, 64, 32]} />
				<shaderMaterial uniforms={uniforms} fragmentShader={frag} vertexShader={vert} side={DoubleSide} />
			</mesh>
			<mesh ref={mesh} position={[0, 0, 0]} scale={scale}>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial uniforms={uniforms} fragmentShader={frag} vertexShader={vert} side={FrontSide} />
			</mesh>
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
