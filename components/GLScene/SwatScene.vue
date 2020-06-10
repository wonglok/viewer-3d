<template>
  <O3D v-if="layouts && shaderCube">

    <LightArea></LightArea>
    <O3D :animated="true" layout="run">
      <O3D :animated="true" layout="center">
        <SwatRun :shaderCube="shaderCube"></SwatRun>
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
import { Tree, RayPlay, PCamera, ShaderCube } from '../Reusable'
import { Scene, Color, Vector3 } from 'three'
// import { Interaction } from 'three.interaction'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'SpacewalkScene',
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

    this.scene.background = new Color('#eaeaea')
    this.shaderCube = new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 32 })
    // this.scene.background = this.shaderCube.out.envMap

    // prepare camera
    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    // this.camera.position.x = -200
    this.camera.position.y = 100
    this.camera.position.z = 500
    this.camera.lookAt(this.scene.position)
    // this.rayplay = new RayPlay({ mounter: this.lookup('element'), base: this.lookup('base'), camera: this.camera })

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // this.controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   this.controls.update()
    // })

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    let parentScrollBox = this.lookup('scrollBox')

    let looper = () => {
      if (!parentScrollBox) { return }

      this.layouts = {
        // lensarea: {
        //   pz: 500
        // },
        run: {
          sx: 1.5,
          sy: 1.5,
          sz: 1.5,
          ry: 0.192 * Math.PI,
        },
        center: {
          ry: (1.0 - parentScrollBox.page) * Math.PI * 1.5,
          pz: (1.0 - parentScrollBox.page) * -2000,
          sx: 150,
          sy: 150,
          sz: 150,
          py: -150,
          // pz: (1.0 - parentScrollBox.page) * 2500
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
