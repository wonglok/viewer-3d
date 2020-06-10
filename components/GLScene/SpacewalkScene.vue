<template>
  <O3D v-if="layouts && shaderCube">

    <O3D :animated="true" layout="bgarea">
      <Spacewalk :shaderCube="shaderCube"></Spacewalk>
    </O3D>

    <!-- <O3D :animated="true" layout="lensarea">
      <LensArea :dudv="'water'"></LensArea>
    </O3D> -->

  </O3D>
</template>

<script>
import { Tree, RayPlay, PCamera, ShaderCube } from '../Reusable'
import { Scene, Color } from 'three'
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

    this.scene.background = new Color('#efefef')

    this.shaderCube = new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 32 })
    // this.scene.background = this.shaderCube.out.envMap

    // prepare camera
    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    this.camera.position.z = 600
    this.rayplay = new RayPlay({ mounter: this.lookup('element'), base: this.lookup('base'), camera: this.camera })

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
        lensarea: {
          pz: 500
        },
        bgarea: {
          sx: 1.0,
          sy: 1.0,
          sz: 1.0,
          pz: (1.0 - parentScrollBox.page) * 2500
        }
      }
    }

    this.lookup('base').onLoop(looper)
  }
}
</script>

<style>

</style>
