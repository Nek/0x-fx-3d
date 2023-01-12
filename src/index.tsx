import { createRoot, events, extend } from '@react-three/fiber'
import { StrictMode } from 'react'
import { Group, Mesh, PerspectiveCamera, PlaneGeometry, SphereGeometry } from 'three'

extend({ SphereGeometry, PlaneGeometry, Mesh, PerspectiveCamera, Group })

import Scene from './Scene'
import './main.css'

const root = createRoot(document.querySelector('canvas')!)

window.addEventListener('resize', () => {
	root.configure({ events, camera: { position: [0, 0, 50] }, size: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight } })
	root.render(<StrictMode><Scene /></StrictMode>)
})

window.dispatchEvent(new Event('resize'))