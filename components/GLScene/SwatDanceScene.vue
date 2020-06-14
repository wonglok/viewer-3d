<template>
  <O3D :animated="true" :layout="`all`">
    <O3D v-if="layouts && shaderCube && camera">
      <AmbinetLight :intensity="2"></AmbinetLight>
      <DirectionalLight :intensity="1"></DirectionalLight>
      <HemisphereLight :intensity="1"></HemisphereLight>
      <O3D :animated="true" layout="walk">
        <Spacewalk></Spacewalk>
      </O3D>

      <!-- <O3D :animated="true" layout="bg">
        <ChromaticsFloor></ChromaticsFloor>
      </O3D> -->

      <O3D :animated="true" layout="run">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correctAxis">
            <SwatRiggedModel @guy="guy = $event;" @guyHead="guyHead = $event" @guyBack="guyBack = $event" @guyFace="guyFace = $event" :move="move" :shaderCube="shaderCube"></SwatRiggedModel>
          </O3D>
        </O3D>
      </O3D>
    </O3D>

    <div class="absolute z-10 top-0 left-0 text-white w-full h-full" ref="domlayer">
    </div>

    <div class="absolute z-10 top-0 right-0 p-3" v-if="guyMounted">
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': showTool, 'border-green-200': showTool }" @click="showTool = !showTool">Actions</div>
      <!-- <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': gyroCam, 'border-green-200': gyroCam }" v-if="gyroPresent" @click="gyroCam = !gyroCam">Gyro Cam</div> -->
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'static', 'border-green-200': viewCameraMode === 'static' }" @click="viewCameraMode = 'static'">Scene Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'chase', 'border-green-200': viewCameraMode === 'chase' }" @click="viewCameraMode = 'chase'">Chase Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'face', 'border-green-200': viewCameraMode === 'face' }" @click="viewCameraMode = 'face'">Face Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'back', 'border-green-200': viewCameraMode === 'back' }" @click="viewCameraMode = 'back'">Back Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': useBloom === true, 'border-green-200': useBloom === true }" @click="useBloom = !useBloom">Bloom Light</div>


      <div v-if="isDev">
        <div>
          <div class="text-white">
            cameraExtraHeight
          </div>
          <div>
            <input type="range" min="-200" step="0.001" max="200" v-model="viewSettings.cameraExtraHeight">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.cameraExtraHeight += 25" @keydown.down="viewSettings.cameraExtraHeight -= 25" v-model="viewSettings.cameraExtraHeight">
          </div>
        </div>

        <div>
          <div class="text-white">
            defaultCloseup
          </div>
          <div>
            <input type="range" min="-1024" step="0.001" max="1024" v-model="viewSettings.defaultCloseup">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.defaultCloseup += 25" @keydown.down="viewSettings.defaultCloseup -= 25" v-model="viewSettings.defaultCloseup">
          </div>
        </div>

        <div v-if="Bloom">
          <div class="text-white">
            Bloom.threshold
          </div>
          <div>
            <input type="range" min="0" step="0.00001" max="1" v-model="Bloom.threshold">
            <input type="number" step="0.00001" class="w-8 text-black px-1" @keydown.up="Bloom.threshold += 0.1" @keydown.down="Bloom.threshold -= 0.1" v-model="Bloom.threshold">
          </div>
        </div>

      </div>
    </div>

    <div v-if="guyMounted && showTool" :class="{ 'ddopacity-25': isLoadingMotion }" class="absolute z-20 top-0 left-0 text-white w-56 overflow-y-auto moves-box">
      <a :ref="`item-${moveItem._id}`" v-for="moveItem in moves" :key="moveItem._id + moveItem.displayName" @click.prevent="chooseMove(moveItem)" class="block px-2 mx-1 my-1 border-gray-100 border" :style="{ backgroundColor: move === moveItem ? '#4299e1' : 'rgba(0,0,0,0.2)' }">{{ moveItem.displayName }}</a>
    </div>

    <div v-show="isLoadingMotion || !guyMounted" class="absolute z-30 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="ddbackground-color: rgb(0,0,0,0.5);" ref="loading">
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20">Loading... <span v-if="!guyMounted">{{ (loadProgress * 100).toFixed(1) }}%</span> </div>
    </div>




    <!-- <div v-if="displayStartMenu" class="absolute z-40 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="background-color: rgb(0,0,0,0.5);">
      <div class="block px-2 mx-1 my-1 border-gray-100 -border text-20 shadow-sm" style="-webkit-tap-highlight-color: transparent;" @click="startGame" v-if="guyMounted">Start Dancing</div>
      <div class="block px-2 mx-1 my-1 border-gray-100 border text-20" v-if="!guyMounted">Downloading 3D Assets... {{ (loadProgress * 100).toFixed(1) }}% </div>
    </div> -->

  </O3D>
</template>

<script>
import { Tree, RayPlay, PCamera, TCamera, ShaderCubeChrome, ShaderCubeSea, makeScroller, ChaseControls, getID } from '../Reusable'
import { Scene, Color, Vector3, LoadingManager, Quaternion, DefaultLoadingManager, Object3D, Camera, FileLoader } from 'three'
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
      useBloom: true,
      Bloom: false,
      camera: false,
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
      layouts: false,
      blur: 0,
      socket: false,
      gyroCam: false,
      gyroPresent: false,
      viewCameraMode: true,
      guyFace: false,
      guyBack: false,

      viewSettings: false,
      isDev: process.env.NODE_ENV === 'development',
      moveCursor: 0,
    }
  },
  computed: {
    guyMounted () {
      return !!this.guy
    }
  },
  methods: {
    onReady () {
      // this.ready = true
      // setTimeout(() => {
      //   this.scene.background = new Color('#fafafa')
      // }, 1000)
    },
    async onNext () {
      this.moveCursor = this.moves.findIndex(mm => mm === this.move) || 0
      this.moveCursor++
      this.moveCursor = this.moveCursor % this.moves.length
      let chosen = this.moves[this.moveCursor]
      await this.chooseMove(chosen, true)
    },
    async onPrev () {
      this.moveCursor = this.moves.findIndex(mm => mm === this.move) || 0
      this.moveCursor--
      this.moveCursor = this.moveCursor % this.moves.length
      let chosen = this.moves[this.moveCursor]
      await this.chooseMove(chosen, true)
    },
    async startGame () {
      sound.play()
      this.displayStartMenu = false
    },
    async chooseMove (item, autoFocus) {
      this.isLoadingMotion = true
      let loaderFBX = new FBXLoader(this.loadingManager)
      let move = await new Promise(async (resolve) => {
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

      if (autoFocus) {
        this.$nextTick(() => {
          let list = this.$refs[`item-${move._id}`]
          if (list) {
            let dom = list[0]
            try {
              dom.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
            } catch (e) {

            }
          }
        })
      }
    }
  },
  created () {
    // document.body.style.opacity = 0
  },
  async mounted () {
    await this.lookupWait('ready')
    let tout = 0
    window.addEventListener('keydown', (ev) => {
      clearTimeout(tout)
      setTimeout(() => {
        if (ev.keyCode === 39 || ev.keyCode === 40) {
          this.onNext()
        } else if (ev.keyCode === 37 || ev.keyCode === 38) {
          this.onPrev()
        }
      }, 0)
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
    let gestureMapper = require('../GLContent/Swat/gesture/fbx').default
    let locomotionMapper = require('../GLContent/Swat/locomotion/fbx').default
    let thrillerMapper = require('../GLContent/Swat/thriller/fbx').default
    let breakdancesMapper = require('../GLContent/Swat/breakdance/fbx').default
    let danceingMapper = require('../GLContent/Swat/dancing/fbx').default
    let capoeiraMapper = require('../GLContent/Swat/capoeira/fbx').default
    let rifleMapper = require('../GLContent/Swat/rifle/fbx').default
    let mmaMapper = require('../GLContent/Swat/mma/fbx').default
    let kickMapper = require('../GLContent/Swat/kick/fbx').default
    let hurtMapper = require('../GLContent/Swat/hurt/fbx').default
    let boxingMapper = require('../GLContent/Swat/boxing/fbx').default
    let boxinghitMapper = require('../GLContent/Swat/boxinghit/fbx').default
    let idleMapper = require('../GLContent/Swat/idle/fbx').default
    let kneeMapper = require('../GLContent/Swat/knee/fbx').default
    let superheroMapper = require('../GLContent/Swat/superhero/fbx').default

    // kneeMapper

    let movesOrig = []

    let addToArr = (mapper) => {
      let arr = []
      for (let kn in mapper) {
        arr.push({
          _id: getID(),
          displayName: kn,
          fbx: false,
          url: mapper[kn]
        })
      }
      arr.sort((a, b) => {
        if (a.displayName > b.displayName) {
            return 1
        } else if (b.displayName > a.displayName) {
            return -1
        } else {
          return 0
        }
      })
      movesOrig = [
        ...movesOrig,
        ...arr
      ]
    }
    if (this.$route.query.fight) {
      addToArr(idleMapper)
      addToArr(kneeMapper)
      addToArr(kickMapper)
      addToArr(boxingMapper)
      addToArr(mmaMapper)
      addToArr(superheroMapper)
      addToArr(boxinghitMapper)
      addToArr(hurtMapper)

      // addToArr(capoeiraMapper)
      // await this.chooseMove(movesOrig.find(e => e.displayName === 'Flying Kick'))
      // await this.chooseMove(movesOrig.find(e => e.displayName === 'Mma Idle'))
      await this.chooseMove(movesOrig.find(e => e.displayName === 'Warming Up'), true)
    } else {
      addToArr(thrillerMapper)
      addToArr(breakdancesMapper)
      addToArr(danceingMapper)

      addToArr(rifleMapper)
      addToArr(locomotionMapper)
      addToArr(gestureMapper)

      // this.chooseMove(this.moves.find(e => e.displayName === 'breakdance freezes'))
      // this.chooseMove(this.moves.find(e => e.displayName === 'brooklyn uprock'))
      // this.chooseMove(this.moves.find(e => e.displayName === 'breakdance footwork to idle (2)'))
      // this.chooseMove(this.moves.find(e => e.displayName === 'breakdance ending 3'))
      // this.chooseMove(movesOrig.find(e => e.displayName === 'Thriller Part 3'))
      await this.chooseMove(movesOrig.find(e => e.displayName === 'Thriller Part 3'), true)
        // .then(() => {
        //   setTimeout(() => {
        //     this.$emit('resetCam', 'face')
        //   }, 100)
        // })
      // await this.chooseMove(movesOrig.find(e => e.displayName === 'Northern Soul Spin Combo'), true)
    }
    this.moves = movesOrig
    /* Moves End */

    this.lookup('base').onLoop(() => {
      TWEEN.update()
    })
    let scene = new Scene()
    scene.add(this.o3d)
    this.$parent.$emit('scene', scene)

    scene.background = new Color('#aaaaaa')
    this.shaderCube = new ShaderCubeChrome({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 64 })
    // this.shaderCubeSea = new ShaderCubeSea({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, resX: 512, resY: 512 })

    let camera = this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    this.$parent.$emit('camera', camera)

    /* BLOOM START */
    let { Vector2 } = require('three/src/math/Vector2')
    let { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer')
    let { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass')
    let { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass')
    var Params = {
      exposure: 1,
      bloomStrength: 1.75,
      bloomThreshold: 0.95534,
      bloomRadius: 1.3
    }
    let renderer = this.lookup('renderer')
    let element = this.lookup('element')
    let rect = element.getBoundingClientRect()
    var renderScene = new RenderPass(scene, camera)
    let dpi = 1
    var bloomPass = new UnrealBloomPass(new Vector2(rect.width * dpi, rect.height * dpi), 1.5, 0.4, 0.85)
    this.Bloom = bloomPass
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

    // this.$parent.$emit('composer', this.composer)
    this.$on('syncBloom', () => {
      if (this.useBloom) {
        this.$parent.$emit('composer', this.composer)
      } else {
        this.$parent.$emit('composer', false)
      }
    })
    this.$watch('useBloom', () => {
      this.$emit('syncBloom')
    })
    this.$emit('syncBloom')
    /* BLOOM END */

    // this.shaderCubeSea = new ShaderCubeSea({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, resX: 1024, resY: 1024 })
    // this.scene.background = this.shaderCubeSea.out.envMap

    // let parentScrollBox = this.lookup('scrollBox')
    let looper = () => {
      this.layouts = {
        walk: {
          sx: 2.5,
          sy: 2.5,
          sz: 2.5,
          pz: 900 * 2.5,
          py: 170 * 2.5
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

          py: -180,
          pz: 100
        }
      }
    }

    this.lookup('base').onLoop(looper)

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, y: 1 }, onMove: () => {} })

    this.viewCameraMode = 'chase'
    this.viewSettings = {
      cameraExtraHeight: 45,
      farest: 900,
      defaultCloseup: 333
    }
    camera.position.z = this.viewSettings.defaultCloseup

    let headPosition = new Vector3()
    let centerPosition = new Vector3()
    let lerperLookAt = new Vector3()
    let lerperCamPos = new Vector3()
    let targetLookAt = new Vector3()
    let targetCamPos = new Vector3()
    let centerRelPos = new Vector3()
    let guyEyePos = new Vector3()
    let infrontOFhead = new Vector3()
    let guyBackPos = new Vector3()

    this.controls = new ChaseControls(camera, this.$refs['domlayer'])
    this.controls.enablePan = true
    this.controls.enableDamping = true
    this.controls.enableKeys = false
    let resetCam = () => {
      vscroll.value = 0
      this.controls.reset()
      if (this.viewCameraMode === 'static') {
        camera.position.z = 1000
        camera.position.y = 50
      } else if (this.viewCameraMode === 'face') {
        this.viewSettings = {
          cameraExtraHeight: 0,
          farest: 900,
          defaultCloseup: 32.283
        }
      } else if (this.viewCameraMode === 'back') {
        this.viewSettings = {
          cameraExtraHeight: 50,
          farest: 900,
          defaultCloseup: -10
        }
      } else if (this.viewCameraMode === 'chase') {
        this.viewSettings = {
          cameraExtraHeight: 45,
          farest: 900,
          defaultCloseup: 333
        }
      }
    }
    this.$watch('viewCameraMode', () => {
      resetCam()
    })
    this.$on('resetCam', (v = 'chase') => {
      this.viewCameraMode = v
    })
    this.viewCameraMode = 'chase'

    // this.viewCameraMode = ''
    // this.$nextTick(() => {
    //   this.viewCameraMode = 'chase'
    // })

    this.lookup('base').onLoop(() => {
      let config = this.viewSettings
      for (let kn in config) {
        if (typeof config[kn] === 'string') {
          let orig = config[kn]
          let newVal = Number(config[kn])
          if (isNaN(newVal)) {
          } else {
            config[kn] = newVal
          }
        }
      }

      let progress = vscroll.value
      let extraZoom = config.defaultCloseup + config.farest * progress * (this.viewCameraMode === 'static' ? 0 : 1)

      if (this.guy && this.guyHead && this.guyFace && this.guyBack) {
        // getting position
        headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
        this.guy.getWorldPosition(centerPosition)

        // looker (guyFace)
        guyEyePos.setFromMatrixPosition(this.guyFace.matrixWorld)
        guyBackPos.setFromMatrixPosition(this.guyBack.matrixWorld)
        // infrontOFhead.(headPosition)

        if (this.viewCameraMode === 'face') {
          // make use of position
          targetCamPos.x = guyEyePos.x
          targetCamPos.y = guyEyePos.y + config.cameraExtraHeight
          targetCamPos.z = guyEyePos.z + extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        } else if (this.viewCameraMode === 'back') {
          // make use of position
          targetCamPos.x = guyBackPos.x
          targetCamPos.y = guyBackPos.y + config.cameraExtraHeight
          targetCamPos.z = guyBackPos.z - extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        } else if (this.viewCameraMode === 'chase') {
          // make use of position
          targetCamPos.x = centerPosition.x
          targetCamPos.y = centerPosition.y + config.cameraExtraHeight
          targetCamPos.z = centerPosition.z + extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        }

        if (this.viewCameraMode === 'face') {
          lerperLookAt.lerp(targetLookAt, 0.2)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'back') {
          lerperLookAt.lerp(targetLookAt, 0.2)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'chase') {
          lerperLookAt.lerp(targetLookAt, 0.05)
          lerperCamPos.lerp(targetCamPos, 0.05)
        }

        if (this.viewCameraMode === 'static') {
          this.controls.enabled = true
          this.controls.update()
        } else {
          this.controls.enabled = false
          camera.lookAt(targetLookAt)
          camera.position.copy(lerperCamPos)
        }
      }
    })

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
  }
}
</script>

<style lang="postcss">
.moves-box{
  height: 170px;
}
@screen lg {
  .moves-box{
    height: 100%;
    padding-bottom: 80px;
  }
}
</style>
