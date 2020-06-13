<template>
  <O3D :animated="true" :layout="`all`">
    <O3D v-if="layouts && shaderCube && camera">
      <LightArea></LightArea>
      <DirectionalLight :amount="4"></DirectionalLight>

      <O3D :animated="true" layout="bg" :visible="guyMounted">
        <ChromaticsFloor></ChromaticsFloor>
      </O3D>

      <O3D :animated="true" layout="run" ref="swatrun">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correctAxis">
            <SwatRiggedModel @guy="guy = $event;" @guyHead="guyHead = $event" :move="move" :scene="scene" :shaderCube="shaderCube"></SwatRiggedModel>
          </O3D>
        </O3D>

        <!-- <O3D :animated="true" layout="center">
          <SwatUpperJab :scene="scene" :shaderCube="shaderCube"></SwatUpperJab>
        </O3D> -->
        <!--
        <O3D :animated="true" layout="left">
          <SwatSideKick :scene="scene" :shaderCube="shaderCube"></SwatSideKick>
        </O3D>
        <O3D :animated="true" layout="right">
          <SwatMMAKick :scene="scene" :shaderCube="shaderCube"></SwatMMAKick>
        </O3D> -->
        <!-- <O3D :animated="true" layout="mouse">
          <SwatIdle :shaderCube="shaderCube" @loaded="$emit('gorun')"></SwatIdle>
        </O3D>
        -->

      </O3D>
    </O3D>

    <div class="absolute z-10 top-0 left-0 text-white w-full h-full" ref="domlayer">
    </div>

    <div class="absolute z-10 top-0 right-0 p-3" v-if="guyMounted">
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': showTool, 'border-green-200': showTool }" @click="showTool = !showTool">Actions</div>
      <!-- <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': gyroCam, 'border-green-200': gyroCam }" v-if="gyroPresent" @click="gyroCam = !gyroCam">Gyro Cam</div> -->
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': useAutoChase, 'border-green-200': useAutoChase }" @click="useAutoChase = !useAutoChase">Chase Camera</div>

      <div v-if="isDev && viewSettings">
        <div>
          <div class="text-white">
            cameraExtraHeight
          </div>
          <div>
            <input type="range" min="-200" step="0.001" max="200" v-model="viewSettings.cameraExtraHeight">
            <input type="text" class="w-8 text-black px-1" @keydown.up="viewSettings.cameraExtraHeight += 25" @keydown.down="viewSettings.cameraExtraHeight -= 25" v-model="viewSettings.cameraExtraHeight">
          </div>
        </div>

        <div>
          <div class="text-white">
            defaultCloseup
          </div>
          <div>
            <input type="range" min="-1024" step="0.001" max="1024" v-model="viewSettings.defaultCloseup">
            <input type="text" class="w-8 text-black px-1" @keydown.up="viewSettings.defaultCloseup += 25" @keydown.down="viewSettings.defaultCloseup -= 25" v-model="viewSettings.defaultCloseup">
          </div>
        </div>
      </div>
    </div>

    <div v-if="guyMounted && showTool" :class="{ 'opacity-25': isLoadingMotion }" class="absolute z-20 top-0 left-0 text-white w-64 h-40 lg:h-full lg:pb-12 overflow-y-auto">
      <a v-for="moveItem in moves" :key="moveItem._id + moveItem.displayName" @click.prevent="chooseMove(moveItem)" class="block px-2 mx-1 my-1 border-gray-100 border">{{ moveItem.displayName }}</a>
    </div>

    <div v-show="isLoadingMotion || !guyMounted" class="absolute z-30 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="ddbackground-color: rgb(0,0,0,0.3);" ref="loading">
      <div class="block px-2 mx-1 my-1 border-gray-100 border text-20">Loading...</div>
    </div>

    <!-- <div v-if="displayStartMenu" class="absolute z-40 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="background-color: rgb(0,0,0,0.5);">
      <div class="block px-2 mx-1 my-1 border-gray-100 -border text-20 shadow-sm" style="-webkit-tap-highlight-color: transparent;" @click="startGame" v-if="guyMounted">Start Dancing</div>
      <div class="block px-2 mx-1 my-1 border-gray-100 border text-20" v-if="!guyMounted">Downloading 3D Assets... {{ (loadProgress * 100).toFixed(1) }}% </div>
    </div> -->

  </O3D>
</template>

<script>
import { Tree, RayPlay, PCamera, TCamera, ShaderCubeChrome, ShaderCubeSea, makeScroller, ChaseControls } from '../Reusable'
import { Scene, Color, Vector3, LoadingManager, Quaternion, DefaultLoadingManager, Object3D, Camera } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Howl, Howler } from 'howler'

var sound = new Howl({
  src: [require('file-loader!~/components/GLContent/Swat/music/ambinet-b.mp3')]
})

// ambinet-b.mp3
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
    let actionList = ['run', 'upper-jab', 'mma-kick', 'side-kick', 'idle']
    let action = this.$route.query.action || actionList[0]
    return {
      guyHead: false,
      loadProgress: 0,
      displayStartMenu: false,
      showTool: true,
      isLoadingMotion: false,
      move: false,
      moves: false,
      actionList,
      action,
      loadingManager:false,
      loaderAPI: false,
      shaderCube: false,
      ready: false,
      settings: {},
      flower1: {},
      guy: false,
      scene: new Scene(),
      layouts: false,
      blur: 0,
      socket: false,
      gyroCam: false,
      gyroPresent: false,
      useAutoChase: true,

      viewSettings: false,
      isDev: process.env.NODE_ENV === 'development'
    }
  },
  computed: {
    guyMounted () {
      return !!this.guy
    }
  },
  methods: {
    async startGame () {
      sound.play()
      this.displayStartMenu = false

      // let gyroPresent = this.gyroPresent = this.gyroCam = await new Promise((resolve) => {
      //   window.addEventListener('deviceorientation', function(event){
      //     var x = event.beta  // In degree in the range [-180,180]
      //     var y = event.gamma // In degree in the range [-90,90]

      //     // Because we don't want to have the device upside down
      //     // We constrain the x value to the range [-90,90]
      //     if (x > 90) { x =  90 }
      //     if (x < -90) { x = -90 }

      //     // To make computation easier we shift the range of
      //     // x and y to [0,180]
      //     x += 90;
      //     y += 90;

      //     console.log(x, y)
      //     if (isNaN(x)) {
      //       resolve(false)
      //     } else {
      //       resolve(true)
      //     }
      //   });
      //   setTimeout(() => {
      //     resolve(false)
      //   }, 10000)
      // })

      // if (window.innerWidth < 500) {
      //   let DeviceOrientationControls = require('three/examples/jsm/controls/DeviceOrientationControls').DeviceOrientationControls
      //   let controls = new DeviceOrientationControls(this.camera, this.lookup('element'))
      //   controls.dampping = true
      //   this.lookup('base').onLoop(() => {
      //     if (this.gyroCam) {
      //       controls.enabled = true
      //       controls.update()
      //     } else {
      //       controls.enabled = false
      //     }
      //   })
      // }
    },
    onReady () {
      // this.ready = true
      // setTimeout(() => {
      //   this.scene.background = new Color('#fafafa')
      // }, 1000)
    },
    async chooseMove (item) {
      this.isLoadingMotion = true
      let loaderFBX = new FBXLoader(this.loadingManager)
      let move = await new Promise((resolve) => {
        // eslint-disable-next-line
        loaderFBX.load(item.url, (v) => {
          item.fbx = v
          // console.log(v)
          resolve(item)
          this.isLoadingMotion = false
        }, (v) => {
          // this.loaderAPI.updateProgress(v.loaded / v.total)
        }, () => {
          resolve(item)
          this.isLoadingMotion = false
        })
      }, console.log)
      this.move = move
    }
  },
  created () {
    // document.body.style.opacity = 0
  },
  async mounted () {
    // let contrs = { opacity: 0 }
    // const tween = new TWEEN.Tween(contrs) // Create a new tween that modifies 'coords'.
    //   .to({ opacity: 1 }, 1000) // Move to (300, 200) in 1 second.
    //   .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    //   .onUpdate(() => {
    //     // totalStat = dat.dynamic
    //     document.body.style.opacity = contrs.opacity
    //   })
    //   .start()
    this.lookup('base').onLoop(() => {
      TWEEN.update()
    })
    await this.lookupWait('ready')

    // prepare camera
    // this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    // // this.camera.position.x = -200
    // // this.camera.position.y = 100
    // this.camera.position.z = 400
    // // this.camera.position.y = 500
    // this.camera.lookAt(this.scene.position)

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, y: 1 }, onMove: () => {} })

    let camera = this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    this.$parent.$emit('camera', this.camera)
    this.useAutoChase = undefined
    this.viewSettings = {
      cameraExtraHeight: 45,
      farest: 900,
      defaultCloseup: 280
    }
    camera.position.z = this.viewSettings.defaultCloseup

    let headPosition = new Vector3()
    let centerPosition = new Vector3()
    let lerperLookAt = new Vector3()
    let lerperCamPos = new Vector3()
    let targetLookAt = new Vector3()
    let targetCamPos = new Vector3()
    let centerRelPos = new Vector3()

    this.controls = new ChaseControls(this.camera, this.$refs['domlayer'])
    this.controls.enablePan = true
    this.controls.enableDamping = true

    this.$watch('useAutoChase', () => {
      this.controls.reset()
      if (!this.useAutoChase) {
        camera.position.z = 900
        camera.position.y = 500
      }
    })
    this.$nextTick(() => {
      this.useAutoChase = window.innerWidth < 500
    })
    // this.lookup('base').onResize(() => {
    //   this.useAutoChase = window.innerWidth < 500
    // })

    this.lookup('base').onLoop(() => {
      let config = this.viewSettings

      for (let kn in config) {
        if (typeof config[kn] === 'string') {
          config[kn] = Number(config[kn])
        }
      }

      let progress = vscroll.value
      if (this.guy && this.guyHead) {
        // getting position
        headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
        centerRelPos.copy(this.guy.position)
        this.guy.getWorldPosition(centerPosition)

        // make use of position
        targetCamPos.x = headPosition.x
        targetCamPos.y = headPosition.y + config.cameraExtraHeight
        targetCamPos.z = headPosition.z + config.defaultCloseup + config.farest * progress * (this.useAutoChase ? 1 : 0)

        targetLookAt.x = headPosition.x
        targetLookAt.y = headPosition.y - config.cameraExtraHeight
        targetLookAt.z = headPosition.z

        lerperLookAt.lerp(targetLookAt, 0.05)
        lerperCamPos.lerp(targetCamPos, 0.05)

        if (this.useAutoChase) {
          this.controls.enabled = false
          camera.lookAt(targetLookAt)
          camera.position.copy(lerperCamPos)
        } else {
          this.controls.enabled = true
          this.controls.update()
        }
      }
    })

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

    /* Dance Moves */
    // let loaderFBX = new FBXLoader(this.loadingManager)

    let gestureMapper = require('../GLContent/Swat/gesture/fbx').default
    let locomotionMapper = require('../GLContent/Swat/locomotion/fbx').default
    let breakdancesMapper = require('../GLContent/Swat/breakdance/fbx').default
    let capoeiraMapper = require('../GLContent/Swat/capoeira/fbx').default
    let rifleMapper = require('../GLContent/Swat/rifle/fbx').default

    let movesOrig = []
    let combinedMapper = {
      ...breakdancesMapper,
      ...capoeiraMapper,
      ...rifleMapper,
      ...locomotionMapper,
      ...gestureMapper
    }
    let i = 0
    for (let kn in combinedMapper) {
      movesOrig.push({
        _id: i,
        displayName: kn,
        fbx: false,
        url: combinedMapper[kn]
      })
      i++
    }
    this.moves = movesOrig

    // this.chooseMove(this.moves.find(e => e.displayName === 'breakdance freezes'))
    this.chooseMove(this.moves.find(e => e.displayName === 'brooklyn uprock'))
    // this.chooseMove(this.moves.find(e => e.displayName === 'breakdance footwork to idle (2)'))

    // let tasks = breakdances.map((item) => {
    //   return new Promise((resolve) => {
    //     // eslint-disable-next-line
    //     loaderFBX.load(item.url, (v) => {
    //       item.fbx = v
    //       // console.log(v)
    //       resolve(item)
    //     }, (v) => {
    //       // console.log(v)
    //       // this.loaderAPI.updateProgress(v.loaded / v.total)
    //     }, () => {
    //       resolve(item)
    //     })
    //   }, console.log)
    // })

    // Promise.all(tasks)
    //   .then((v) => {
    //     this.moves = v
    //     this.$nextTick(() => {
    //       this.move = this.moves[0]
    //     })
    //   })

    /* dance moves end */

    /* AutoStart Start */
    if (process.env.NODE_ENV === 'development') {
      this.$watch('guy', () => {
        if (this.guy && window.innerWidth > 500) {
          this.startGame()
        }
      })
    }
    /* AutoStart End */

    /* BLOOM START */
    let { Vector2 } = require('three/src/math/Vector2')
    let { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer')
    let { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass')
    let { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass')
    var Params = {
      exposure: 1,
      bloomStrength: 1.5,
      bloomThreshold: 0.99,
      bloomRadius: 1.2
    }
    let renderer = this.lookup('renderer')
    let element = this.lookup('element')
    let rect = element.getBoundingClientRect()
    var renderScene = new RenderPass(this.scene, this.camera)
    let dpi = 1
    var bloomPass = new UnrealBloomPass(new Vector2(rect.width * dpi, rect.height * dpi), 1.5, 0.4, 0.85)
    bloomPass.threshold = Params.bloomThreshold
    bloomPass.strength = Params.bloomStrength
    bloomPass.radius = Params.bloomRadius

    this.composer = new EffectComposer(renderer)
    this.composer.addPass(renderScene)
    this.composer.addPass(bloomPass)
    this.lookup('base').onResize(() => {
      let rect = element.getBoundingClientRect()
      let dpi = 1
      bloomPass.setSize(rect.width * dpi, rect.height * dpi)
      this.composer.setSize(rect.width * dpi, rect.height * dpi)
    })

    this.$parent.$emit('composer', this.composer)
    /* BLOOM END */

    this.scene.background = new Color('#bababa')
    this.shaderCube = new ShaderCubeChrome({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 32 })
    // this.shaderCubeSea = new ShaderCubeSea({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, resX: 1024, resY: 1024 })
    // this.scene.background = this.shaderCubeSea.out.envMap

    this.scene.add(this.o3d)
    this.$parent.$emit('scene', this.scene)


    // let origPos = this.camera.position.clone()
    // this.controls.addEventListener('change', () => {
    //   origPos.copy(this.camera.position)
    // })

    // let parentScrollBox = this.lookup('scrollBox')
    let looper = () => {
      this.layouts = {
        all: {
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
          ry: Math.PI * -0.25,

          sx: 1,
          sy: 1,
          sz: 1,
          // pz: -100,
          // rx: Math.PI * 0.05 + Math.PI

          // pz: -250,
          // px: -2250,
          // ry: Math.PI * 0.15,
        },
        correctAxis: {
          rz: Math.PI * 0.5,
          rx: Math.PI * -0.5
        },
        center: {
          // ry: Math.PI * (progress),
          sx: 180,
          sy: 180,
          sz: 180,

          py: -180
        },
        // left: {
        //   // ry: Math.PI * 2 * (progress),
        //   px: 100,
        //   sx: 150,
        //   sy: 150,
        //   sz: 150,
        //   py: -150,
        //   // pz: (1 - parentScrollBox.page) * -2000
        //   // pz: (1.0 - parentScrollBox.page) * 2500
        // },
        // right: {
        //   // ry: Math.PI * 2 * (progress),
        //   px: -100,
        //   sx: 150,
        //   sy: 150,
        //   sz: 150,
        //   py: -150,
        //   // pz: (1 - parentScrollBox.page) * -2000
        //   // pz: (1.0 - parentScrollBox.page) * 2500
        // }
      }
    }

    this.lookup('base').onLoop(looper)
  }
}
</script>

<style>

</style>
