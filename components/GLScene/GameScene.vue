<template>
  <O3D v-if="layouts">

    <O3D v-if="layouts && shaderCube && camera">
      <AmbinetLight :intensity="2"></AmbinetLight>
      <DirectionalLight :intensity="1"></DirectionalLight>
      <HemisphereLight :intensity="1"></HemisphereLight>
      <O3D :animated="true" layout="walk">
        <SwatWalk></SwatWalk>
      </O3D>

      <!-- <O3D :animated="true" layout="bg">
        <ChromaticsFloor></ChromaticsFloor>
      </O3D> -->

      <O3D :animated="true" layout="run">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correctAxis">
            <SwatRiggedModel @removeGLTF="removeGLTF({ gltf: $event })" @setupGLTF="setupGLTF({ gltf: $event })" @guy="guy = $event;" @guyHead="guyHead = $event" @guyBack="guyBack = $event" @guyFace="guyFace = $event" :move="move" :shaderCube="shaderCube"></SwatRiggedModel>
          </O3D>
        </O3D>
      </O3D>
    </O3D>

    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center" :style="{ backgroundColor: displayStartMenu ? `rgba(0,0,0,0.6)` : '' }" ref="startmenu">
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white cursor-pointer" v-if="displayStartMenu" @click="displayStartMenu = false">Start Game</div>
    </div>
  </O3D>
</template>

<script>
import { Tree, PCamera, ShaderCubeChrome } from '../Reusable'
import { Scene, Color, TextureLoader, DefaultLoadingManager } from 'three'

// import { Interaction } from 'three.interaction'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// let Cache = {}

export default {
  name: 'GospelScene',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
      displayStartMenu: true,

      // guy
      guy: false,
      guyHead: false,
      guyBack: false,
      guyFace: false,

      move: false,
      Math,
      shaderCube: false,
      settings: {},
      flower1: {},
      image: false,
      scene: new Scene(),
      tCube: false,
      layouts: false,
      blur: 0,
      socket: false
    }
  },
  methods: {
    click () {
      console.log('123')
    },
    removeGLTF ({ gltf }) {

    },
    setupGLTF ({ gltf }) {

    }
  },
  beforeDestroy () {
  },

  async mounted () {
    await this.lookupWait('ready')

    /* Loader START */
    this.loadingManager = DefaultLoadingManager
    this.loadingManager.onURL = (url, progress) => {
      let { itemsLoaded, itemsTotal } = this.loadingManager.stat
      let overallProgressDetailed = itemsLoaded / itemsTotal + progress / itemsTotal
      this.loadProgress = (overallProgressDetailed)
    }
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.loadProgress = (itemsLoaded / itemsTotal)
      this.loadingManager.stat = { itemsLoaded, itemsTotal }
    }
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.loadProgress = (itemsLoaded / itemsTotal)
      this.loadingManager.stat = { itemsLoaded, itemsTotal }
    }
    this.loadingManager.onEnd = (url, itemsLoaded, itemsTotal) => {
      this.loadProgress = (itemsLoaded / itemsTotal)
      this.loadingManager.stat = { itemsLoaded, itemsTotal }
    }
    /* Loader End */

    this.shaderCube = new ShaderCubeChrome({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 64 })

    this.scene.background = new Color('#1a1a1a')

    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    this.camera.position.z = 500

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // this.controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   this.controls.update()
    // })

    let PointerLockControls = require('three/examples/jsm/controls/PointerLockControls.js').PointerLockControls
    let controls = new PointerLockControls(this.camera, this.$refs['startmenu'])

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    // let parentScrollBox = this.lookup('scrollBox')

    let looper = () => {
      // if (!parentScrollBox) { return }
      this.layouts = {
        walk: {
          sx: 2.5,
          sy: 2.5,
          sz: 2.5,
          pz: 900 * 2.5,
          py: 172 * 2.5
        },
        bg: {
          // pz: -400,
          sx: 2,
          sy: 2,
          sz: 1,
          py: -180,
          rx: Math.PI * 0.5
        },

        run: {
          sx: 1,
          sy: 1,
          sz: 1
        },
        correctAxis: {
          rx: Math.PI * -0.5,
          ry: Math.PI * -1.5,
          rz: Math.PI * 0.5
        },
        center: {
          ry: Math.PI * -0.5,

          // ry: Math.PI * (progress),
          sx: 180,
          sy: 180,
          sz: 180,

          py: -180,
          pz: 100
        }
      }
    }

    this.lookup('base').onLoop(looper)
  }
}
</script>

<style>

</style>
