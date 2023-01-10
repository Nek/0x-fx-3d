import * as THREE from '@react-three/fiber'
import { useFrame, useLoader } from '@react-three/fiber'
import { useRef } from 'react'

import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(<App />)
