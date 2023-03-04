import vert from './plasma.vert?raw'
import frag from './plasma.frag?raw'
import { useEffect, useMemo, useRef } from 'react'

import paletteUrl from './palette3.png'

import {
  CubeCamera as DCubeCamera,
  PerspectiveCamera as DPerspectiveCamera,
  Stats,
  useAspect,
  useTexture,
  MeshReflectorMaterial,
} from '@react-three/drei'

import { useControls, folder } from 'leva'

import {
  DepthOfField,
  EffectComposer,
  Noise,
  Scanline,
  Sepia,
  //@ts-ignore
} from '@react-three/postprocessing'

import { extend, useFrame, useThree } from '@react-three/fiber'

import { el } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'

import {
  AmbientLight,
  CubeCamera,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SphereGeometry,
  ShaderMaterial,
  BackSide,
  RectAreaLight,
} from 'three'

extend({
  AmbientLight,
  CubeCamera,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SphereGeometry,
  ShaderMaterial,
  BackSide,
  RectAreaLight,
})

const ctx = new AudioContext()
const core = new WebRenderer()

const Scene = () => {
  useEffect(() => {
    ;(async () => {
      let node = await core.initialize(ctx, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      })

      node.connect(ctx.destination)
      core.on('load', function () {
        window.addEventListener('click', async function (_) {
          if (ctx.state === 'suspended') {
            await ctx.resume()
          }
          core.render(
            el.lowpass(
              el.add(200, el.mul(1000, el.mul(0.5, el.add(1, el.cycle(0.02))))),
              1.2,
              el.mul(0.1, el.noise())
            )
          )
        })
      })
    })()
  }, [])

  const sphereMaterialRef = useRef<ShaderMaterial>(null!)
  const planeMaterialRef = useRef<ShaderMaterial>(null!)

  const { viewport } = useThree()

  const scale = useAspect(viewport.width, viewport.height)

  const uAspectRatio = scale[0] / scale[1]

  const texture = useTexture(paletteUrl)

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 1.0,
      },
      uDeltaTime: {
        value: 0.0,
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
        value: [20 / 100, 120 / 100, 19 / 100],
      },
      uFlip: { value: 1.0 },
      uColorTable: { value: texture },
    }),
    []
  )

  const controls = {
    Scale: {
      min: 1,
      max: 50,
      step: 1,
      value: 32,
    },
    Ratios: folder({
      R1: {
        value: 45,
        min: 1,
        max: 241,
        step: 1,
      },
      R2: {
        value: 97,
        min: 1,
        max: 241,
        step: 1,
      },
      R3: {
        value: 108,
        min: 1,
        max: 241,
        step: 1,
      },
    }),
    FX: folder({
      DOF: true,
      Scanline: false,
      Noise: true,
      Sepia: false,
    }),
  }

  const plasmaData = useControls(controls)

  useFrame((state) => {
    const { clock } = state
    if (sphereMaterialRef.current) {
      const sphereMaterial = sphereMaterialRef.current
      sphereMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
      sphereMaterial.uniforms.uAspectRatio.value = uAspectRatio
      sphereMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
      sphereMaterial.uniforms.uR.value = [
        plasmaData.R1 / 100,
        plasmaData.R2 / 100,
        plasmaData.R3 / 100,
      ]
      sphereMaterial.uniforms.uFlip.value = 1.0
      sphereMaterial.uniforms.uDeltaTime.value = clock.getDelta()
    }
    if (planeMaterialRef.current) {
      const planeMaterial = planeMaterialRef.current
      planeMaterial.uniforms.uTime.value = clock.getElapsedTime() / 5
      planeMaterial.uniforms.uAspectRatio.value = uAspectRatio
      planeMaterial.uniforms.uScale.value = plasmaData.Scale / 1000
      planeMaterial.uniforms.uR.value = [
        plasmaData.R1 / 100,
        plasmaData.R2 / 100,
        plasmaData.R3 / 100,
      ]
      planeMaterial.uniforms.uFlip.value = 1.0
    }
  })

  const sphereScale =
    scale[0] / scale[1] <= 0.7 ? (scale[0] / scale[1]) * 1.7 : 1.2

  return (
    <>
      <Stats />
      <rectAreaLight
        width={7}
        height={7}
        position={[0, 5, 2]}
        visible={true}
        intensity={3}
        color={0xffffff}
      />
      <rectAreaLight
        width={7}
        height={7}
        position={[0, -5, 1]}
        visible={true}
        intensity={4}
        color={0xffffff}
      />
      <DPerspectiveCamera far={15} near={2} makeDefault position={[0, 0, 5]} />
      <DCubeCamera>
        {/*@ts-ignore*/}
        {(texture) => (
          <mesh scale={sphereScale} position={[0, 0, 0]}>
            <sphereGeometry args={[1, 128, 64]} />
            <MeshReflectorMaterial
              mirror={0.5}
              metalness={0}
              envMapIntensity={0.5}
              color={0x9977ee}
              roughness={0.1}
              envMap={texture}
              resolution={256}
            />
          </mesh>
        )}
      </DCubeCamera>
      <mesh scale={sphereScale * 1.5} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[5, 64, 32]} />
        <shaderMaterial
          side={BackSide}
          ref={planeMaterialRef}
          uniforms={uniforms}
          fragmentShader={frag}
          vertexShader={vert}
        />
      </mesh>
      <EffectComposer>
        {plasmaData.DOF ? <DepthOfField bokehScale={0.5} /> : <></>}
        {plasmaData.Scanline ? (
          <Scanline
            density={3.2} // scanline density
          />
        ) : (
          <></>
        )}
        {plasmaData.Noise ? (
          <Noise
            opacity={0.8}
          />
        ) : (
          <></>
        )}
        {plasmaData.Sepia ? <Sepia opacity={1} /> : <></>}
      </EffectComposer>
    </>
  )
}

export default Scene
