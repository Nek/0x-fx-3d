import v from './waves.vert'
import f from './waves.frag'
import * as THREE from 'three'
import { Suspense, useRef } from 'react'
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber'
import { shaderMaterial } from "@react-three/drei"


const WaveShaderMaterial = shaderMaterial(
	// Uniform
	{
		uTime: 0,
		uColor: new THREE.Color(0.0, 0.0, 0.0),
		uTexture: new THREE.Texture(),
	},
	// Vertex Shader
	v,
	// Fragment Shader
	f
)

extend({ WaveShaderMaterial })

const Wave = () => {
	const ref = useRef()
	useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()))

	const [image] = useLoader(THREE.TextureLoader, [
		'https://images.unsplash.com/photo-1534312527009-56c7016453e6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
	])

	return (
		<mesh>
			<planeBufferGeometry args={[0.6, 0.8, 50, 50]} />
			<waveShaderMaterial
				side={THREE.DoubleSide}
				uColor={'hotpink'}
				ref={ref}
				uTexture={image}
			/>
		</mesh>
	)
}
const Scene = () => {
	return (
		<Canvas camera={{ fov: 15, position: [0, 0, 5] }}>
			<Suspense fallback={'loading...'}>
				<Wave />
			</Suspense>
		</Canvas>
	)
}

const App = () => {
	return (
		<>
			<p>let it happen</p>
			<Scene />
		</>
	)
}

export default App
