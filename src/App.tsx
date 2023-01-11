import v from './waves.vert'
import f from './waves.frag'
import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { Center, PerspectiveCamera, useAspect } from '@react-three/drei'

const Wave = () => {
	const mesh = useRef()
	useFrame((state) => {
		const { clock } = state
		if (mesh.current) {
			mesh.current.material.uniforms.uTime.value = clock.getElapsedTime()
		}
	})

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 1.0,
			},
			uRes: {
				value: [1024, 1024],
			},
		}),
		[]
	)

	return (
		<mesh ref={mesh} >
			<planeGeometry args={[2, 2]} />
			<shaderMaterial uniforms={uniforms} fragmentShader={f} vertexShader={v} side={DoubleSide} />
		</mesh>
	)
}
const Scene = () => {
	return (
		<Canvas>
			<PerspectiveCamera makeDefault position={[0, 0, 10]} />

			<Suspense fallback={'loading...'}>
				<Wave />
			</Suspense>
		</Canvas >
	)
}

const App = () => {
	return <Scene />
}

export default App
