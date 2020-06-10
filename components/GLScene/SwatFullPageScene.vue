<template>
  <O3D v-if="layouts && shaderCube">

    <LightArea></LightArea>
    <O3D :animated="true" layout="run">
      <O3D :animated="true" layout="center">
        <SwatRun :shaderCube="shaderCube" @loaded="$emit('gorun')"></SwatRun>
      </O3D>
    </O3D>

<!--
    <O3D :animated="true" layout="mouse">
      <MouseDance :shaderCube="shaderCube"></MouseDance>
    </O3D>
    <O3D :animated="true" layout="mouse2">
      <MouseSillyDance :shaderCube="shaderCube"></MouseSillyDance>
    </O3D> -->

    <!-- <PointLight></PointLight> -->

    <!-- <O3D :animated="true" layout="lensarea">
      <LensArea :dudv="'water'"></LensArea>
    </O3D> -->

  </O3D>
</template>

<script>
import { Tree, RayPlay, PCamera, ShaderCube, makeScroller } from '../Reusable'
import { Scene, Color, Vector3 } from 'three'
// import { Interaction } from 'three.interaction'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
const TWEEN = require('@tweenjs/tween.js').default

export default {
  name: 'SwatFullPage',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
      shaderCube: false,
      ready: false,
      settings: {},
      flower1: {},

      scene: new Scene(),
      paint2DTex: false,
      paintCubeTex: false,
      layouts: false,
      blur: 0,
      socket: false
    }
  },
  methods: {
    onReady () {
      // this.ready = true
      // setTimeout(() => {
      //   this.scene.background = new Color('#fafafa')
      // }, 1000)
    }
  },
  async mounted () {
    await this.lookupWait('ready')

    this.scene.background = new Color('#ffffff')
    this.shaderCube = new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 32 })
    // this.scene.background = this.shaderCube.out.envMap

    // prepare camera
    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    // this.camera.position.x = -200
    // this.camera.position.y = 100
    this.camera.position.z = 500
    // this.camera.lookAt(this.scene.position)
    // this.rayplay = new RayPlay({ mounter: this.lookup('element'), base: this.lookup('base'), camera: this.camera })

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // this.controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   this.controls.update()
    // })

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.lookup('element'), limit: { direction: 'vertical', canRun: true, y: 1 }, onMove: () => {} })

    this.lookup('base').onLoop(() => {
      TWEEN.update()
    })

    const tween = new TWEEN.Tween(vscroll) // Create a new tween that modifies 'coords'.
      .to({ value: 1 }, 3000) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => {
        // Called after tween.js updates 'coords'.
        // Move 'box' to the position described by 'coords' with a CSS translation.
      })
       // Start the tween immediately.
    this.$on('gorun', () => {
      tween.start()
    })
    // let parentScrollBox = this.lookup('scrollBox')

    let looper = () => {
      let progress = vscroll.value
      // console.log(progress)
      // if (!parentScrollBox) { return }
      this.layouts = {
        lensarea: {
          pz: 450,
          py: progress * this.screen.height
        },
        run: {
          sx: 3,
          sy: 3,
          sz: 3,
          pz: -200,
          ry: 0.192 * Math.PI,
        },
        center: {
          // ry: (1.0 - progress) * Math.PI * 1.5,
          pz: 0,
          sx: 150,
          sy: 150,
          sz: 150,
          py: -150,
          pz: (1.0 - progress) * -2500
        },
        mouse: {
          px: 150,
          sx: 150,
          sy: 150,
          sz: 150,
          py: -150,
          // pz: (1 - parentScrollBox.page) * -2000
          // pz: (1.0 - parentScrollBox.page) * 2500
        },
        mouse2: {
          px: -150,
          sx: 150,
          sy: 150,
          sz: 150,
          py: -150,
          // pz: (1 - parentScrollBox.page) * -2000
          // pz: (1.0 - parentScrollBox.page) * 2500
        }
      }
    }

    this.lookup('base').onLoop(looper)
  }
}
</script>

<style>

</style>
