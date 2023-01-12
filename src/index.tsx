import { createRoot } from 'react-dom/client'
import { SphereGeometry } from 'three/src/geometries/SphereGeometry'
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry'
import { Mesh } from 'three/src/objects/Mesh'
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera'
import { Group } from 'three/src/objects/Group'
extend({ SphereGeometry, PlaneGeometry, Mesh, ShaderMaterial, PerspectiveCamera, Group })

import App from './App'
import './main.css'
import { extend } from '@react-three/fiber'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(<App />)
