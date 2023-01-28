import { createRoot, events, extend } from '@react-three/fiber'
import { StrictMode } from 'react'

import { AmbientLight, CubeCamera, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, SphereGeometry, ShaderMaterial } from 'three'
extend({ Group, Mesh, PerspectiveCamera, PlaneGeometry, SphereGeometry, CubeCamera, AmbientLight, MeshStandardMaterial, ShaderMaterial })

import Scene from './Scene'
import './main.css'

const canv = document.querySelector('canvas')!
const root = createRoot(canv)

window.addEventListener('resize', () => {
	root.configure({ events, size: { top: 0, left: 0, width: window.innerWidth / 8, height: window.innerHeight / 8 } })
	root.render(<StrictMode><Scene /></StrictMode>)
	canv.style.width = '100%'
	canv.style.height = '100%'
})

window.dispatchEvent(new Event('resize'))