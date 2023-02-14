import { createRoot, events } from '@react-three/fiber'

import Scene from './Scene'
import './main.css'

const canv = document.querySelector('canvas')!
const root = createRoot(canv)

window.addEventListener('resize', () => {
  root.configure({
    events,
    size: {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  })
  root.render(<Scene />)
})

window.dispatchEvent(new Event('resize'))
