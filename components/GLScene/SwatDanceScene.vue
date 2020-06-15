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

      <!-- <O3D :animated="true" layout="run"> -->
      <O3D :animated="true" layout="center">
        <O3D :animated="true" layout="correctAxis">
          <SwatRiggedModel @removeGLTF="removeGLTF({ gltf: $event })" @setupGLTF="setupGLTF({ gltf: $event })" @guy="guy = $event;" @guyHead="guyHead = $event" @guyBack="guyBack = $event" @guyFace="guyFace = $event" :move="move" :shaderCube="shaderCube"></SwatRiggedModel>
        </O3D>
      </O3D>
      <!-- </O3D> -->
    </O3D>

    <div class="absolute z-10 top-0 left-0 text-white w-full h-full" ref="domlayer">
    </div>

    <div class="absolute z-10 top-0 right-0 p-3" v-if="guyMounted">
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': useBloom === true, 'border-green-200': useBloom === true }" @click="useBloom = !useBloom">Bloom Light</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': showTool, 'border-green-200': showTool }" @click="showTool = !showTool">Actions</div>

      <!-- <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': gyroCam, 'border-green-200': gyroCam }" v-if="gyroPresent" @click="gyroCam = !gyroCam">Gyro Cam</div> -->
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'static', 'border-green-200': viewCameraMode === 'static' }" @click="viewCameraMode = 'static'">Scene Camera</div>

      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'close', 'border-green-200': viewCameraMode === 'close' }" @click="viewCameraMode = 'close'">Closeup Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'chase', 'border-green-200': viewCameraMode === 'chase' }" @click="viewCameraMode = 'chase'">Chase Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'face', 'border-green-200': viewCameraMode === 'face' }" @click="viewCameraMode = 'face'">Face Camera</div>
      <div class="text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'back', 'border-green-200': viewCameraMode === 'back' }" @click="viewCameraMode = 'back'">Back Camera</div>


      <div v-if="isDev">
        <div>
          <div class="text-white">
            adjustX
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustX">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustX += 25" @keydown.down="viewSettings.adjustX -= 25" v-model="viewSettings.adjustX">
          </div>
        </div>
        <div>
          <div class="text-white">
            adjustY
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustY">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustY += 25" @keydown.down="viewSettings.adjustY -= 25" v-model="viewSettings.adjustY">
          </div>
        </div>
        <div>
          <div class="text-white">
            adjustZ
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustZ">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustZ += 25" @keydown.down="viewSettings.adjustZ -= 25" v-model="viewSettings.adjustZ">
          </div>
        </div>
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
      <a :ref="`item-${moveItem._id}`" v-for="moveItem in moves" :key="moveItem._id + moveItem.displayName" @click.prevent="pickMove({ chosenMove: moveItem })" class="block px-2 mx-1 my-1 border-gray-100 border" :style="{ backgroundColor: move === moveItem ? '#4299e1' : 'rgba(0,0,0,0.2)' }">{{ moveItem.displayName }}</a>
    </div>

    <div v-show="!guyMounted" class="absolute z-30 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="ddbackground-color: rgb(0,0,0,0.5);" ref="loading">
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20">Loading... <span v-if="!guyMounted">{{ (loadProgress * 100).toFixed(1) }}%</span> </div>
    </div>

    <!--
    <div v-if="displayStartMenu" class="absolute z-40 top-0 left-0 text-white w-full h-full flex justify-center items-center" style="background-color: rgb(0,0,0,0.5);">
      <div class="block px-2 mx-1 my-1 border-gray-100 -border text-20 shadow-sm" style="-webkit-tap-highlight-color: transparent;" @click="startGame" v-if="guyMounted">Start Dancing</div>
      <div class="block px-2 mx-1 my-1 border-gray-100 border text-20" v-if="!guyMounted">Downloading 3D Assets... {{ (loadProgress * 100).toFixed(1) }}% </div>
    </div>
    -->

  </O3D>
</template>

<script>
import { Tree, RayPlay, PCamera, TCamera, ShaderCubeChrome, ShaderCubeSea, makeScroller, ChaseControls, getID } from '../Reusable'
import { Clock, AnimationMixer, Scene, Color, Vector3, LoadingManager, Quaternion, DefaultLoadingManager, Object3D, Camera, FileLoader, LoopOnce } from 'three'
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
      lastTweenMap: new Map(),
      gltfs: [],
      useBloom: true,
      Bloom: false,
      camera: false,
      guyHead: false,
      loadProgress: 0,
      displayStartMenu: false,
      showTool: true,
      isLoadingMotion: false,
      lastMove: false,
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
    removeGLTF ({ gltf }) {
      this.gltfs.splice(this.gltfs.indexOf(gltf), 1)
    },
    async setupGLTF ({ gltf }) {
      this.gltfs.push(gltf)
      var mixer = gltf.mixer = new AnimationMixer(gltf.scene);
      let clock = new Clock()
      this.lookup('base').onLoop(() => {
        mixer.update(clock.getDelta())
      })
      if (this.move) {
        this.pickMove({ chosenMove: this.move, autoFocusDIV: true, blendInAction: false })
      }
    },
    async tryWaitAnimationEnd (animation) {
      return new Promise(async (resolve) => {
        this.waitDoOnce({
          getter: () => {
            return animation.enabled == false
          },
          fnc: (v) => {
            resolve(v)
          }
        })
      })
    },
    // chooseAnimationNow ({ fromMove, toMove, mixer }) {
    //   if (fromMove) {
    //     fromMove.actionFBX.animations.forEach((clip) => {
    //       let action = mixer.clipAction(clip)
    //       action.setEffectiveTimeScale(1)
    //       action.setEffectiveWeight(0)
    //       action.enabled = false
    //       action.stop()
    //     })
    //   }
    //   if (toMove) {
    //     toMove.actionFBX.animations.forEach((clip) => {
    //       let action = mixer.clipAction(clip)
    //       action.setEffectiveTimeScale(1)
    //       action.setEffectiveWeight(1)
    //       action.enabled = true
    //       action.play()
    //     })
    //   }
    // },
    chooseAnimation ({ fromMove, toMove, mixer }) {
      if (fromMove && fromMove.actionFBX && toMove !== fromMove) {
        fromMove.actionFBX.animations.forEach((clip) => {
          let action = mixer.clipAction(clip)
          let vari = { weight: 1 }
          const tween = new TWEEN.Tween(vari) // Create a new tween that modifies 'coords'.
            .to({ weight: 0 }, 1000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onStart(() => {
              action.enabled = true
            })
            .onUpdate(() => {
              action.setEffectiveTimeScale(1);
              action.setEffectiveWeight(vari.weight);
            })
            .onComplete(() => {
              this.lastTweenMap.set('fromMove', false)
              action.setEffectiveWeight(0)
              action.enabled = false
            })
            .onStop(() => {
              this.lastTweenMap.set('fromMove', false)
              action.setEffectiveWeight(0)
              action.enabled = false
            })
          if (this.lastTweenMap.get('fromMove')) {
            this.lastTweenMap.get('fromMove').chain(tween)
          } else {
            tween.start()
          }
        })
      }
      if (toMove && toMove.actionFBX && fromMove) {
        toMove.actionFBX.animations.forEach((clip) => {
          let action = mixer.clipAction(clip)
          let vari = { weight: 0 }
          const tween = new TWEEN.Tween(vari) // Create a new tween that modifies 'coords'.
            .to({ weight: 1 }, 1000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onStart(() => {
              action.clampWhenFinished = true
              action.enabled = true
              action.loop = LoopOnce
              action.play()
              let hh = (e) => {
                if (e.action === action) {
                  mixer.removeEventListener('loop', hh)
                  this.$emit('move-end', toMove)
                }
              }
              mixer.addEventListener('finished', hh)
            })
            .onUpdate(() => {
              action.setEffectiveTimeScale(1)
              action.setEffectiveWeight(vari.weight)
            })
            .onComplete(() => {
              this.lastTweenMap.set('toMove', false)
              action.enabled = true
            })
            .onStop(() => {
              this.lastTweenMap.set('toMove', false)
              action.setEffectiveTimeScale(1)
              action.setEffectiveWeight(vari.weight)
              action.enabled = true
            })
            .start()
          if (this.lastTweenMap.get('toMove')) {
            this.lastTweenMap.get('toMove').chain(tween)
          } else {
            tween.start()
          }
        })
      }
      if (!fromMove && toMove) {
        toMove.actionFBX.animations.forEach((clip) => {
          let action = mixer.clipAction(clip)
          action.enabled = true
          action.play()
        })
      }
    },
    async onNext () {
      this.moveCursor = this.moves.findIndex(mm => mm === this.move) || 0
      this.moveCursor++
      this.moveCursor = this.moveCursor % this.moves.length
      let chosen = this.moves[this.moveCursor]
      await this.pickMove(chosen, true)
    },
    async onPrev () {
      this.moveCursor = this.moves.findIndex(mm => mm === this.move) || 0
      this.moveCursor--
      this.moveCursor = this.moveCursor % this.moves.length
      let chosen = this.moves[this.moveCursor]
      await this.pickMove(chosen, true)
    },
    async startGame () {
      sound.play()
      this.displayStartMenu = false
    },
    async waitGetGLTFByname (gltfName) {
      return new Promise(async (resolve) => {
        this.waitDoOnce({
          getter: () => {
            return this.gltfs.find(e => e.gltfName === gltfName)
          },
          fnc: (v) => {
            resolve(v)
          }
        })
      })
    },
    async loadMove (chosenMove) {
      let loaderFBX = this.loaderFBX = this.loaderFBX || new FBXLoader(this.loadingManager)
      return await new Promise(async (resolve) => {
        if (chosenMove.actionFBX) {
          resolve(chosenMove)
          this.isLoadingMotion = false
          return
        }
        // eslint-disable-next-line
        loaderFBX.load(chosenMove.url, (v) => {
          chosenMove.actionFBX = v
          // console.log(v)
          resolve(chosenMove)
          this.isLoadingMotion = false
        }, (v) => {
          // this.loaderAPI.updateProgress(v.loaded / v.total)
        }, () => {
          resolve(chosenMove)
          this.isLoadingMotion = false
        })
      }, console.log)
    },
    async pickMove ({ chosenMove, autoFocusDIV, blendInAction = true }) {
      this.isLoadingMotion = true
      let fromMove = this.move

      let move = await this.loadMove(chosenMove)
      let toMove = move
      this.move = move

      let gltf = await this.waitGetGLTFByname('swat-guy')

      await this.chooseAnimation({ fromMove, toMove, mixer: gltf.mixer, gltf })
      // if (blendInAction) {
      //   await this.chooseAnimationNow({ fromMove, toMove, mixer: gltf.mixer, gltf })
      // } else {
      // }

      if (autoFocusDIV) {
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
    },
    async chooseDefaultDanceMove () {
      if (this.$route.query.fight) {
        // await this.pickMove({ chosenMove: movesOrig.find(e => e.displayName === 'Double Leg Takedown - Attacker (1)'), autoFocusDIV: true })
        await this.pickMove({ chosenMove: this.moves.find(e => e.displayName === 'Warming Up'), autoFocusDIV: true, blendInAction: false })
          .then(() => {
            setTimeout(() => {
              this.$emit('resetCam', 'face')
            }, 0)
            this.$once('changeToChase', () => {
              this.viewCameraMode = 'chase'
            })
            this.$watch('move', () => {
              this.$emit('changeToChase')
            })
          })
        // await this.pickMove({ chosenMove: this.moves.find(e => e.displayName === 'Mma Idle'), autoFocusDIV: true })
        // await this.pickMove(this.moves.find(e => e.displayName === 'Warming Up'), true, true)

      } else {
        await this.pickMove({ chosenMove: this.moves.find(e => e.displayName === 'Northern Soul Floor Combo'), autoFocusDIV: true })
          // .then(() => {
          //   setTimeout(() => {
          //     this.$emit('resetCam', 'face')
          //   }, 0)
          //   this.$once('changeToChase', () => {
          //     this.viewCameraMode = 'chase'
          //   })
          //   this.$watch('move', () => {
          //     this.$emit('changeToChase')
          //   })
          // })
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
    let kickMapper = require('../GLContent/Swat/kick/fbx').default
    let boxingMapper = require('../GLContent/Swat/boxing/fbx').default
    let boxinghitMapper = require('../GLContent/Swat/boxinghit/fbx').default
    let idleMapper = require('../GLContent/Swat/idle/fbx').default
    let superheroMapper = require('../GLContent/Swat/superhero/fbx').default
    // kneeMapper

    let movesOrig = []

    let addToArr = async (mapper, preload) => {
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

      if (preload) {
        for (let mymove of arr) {
          this.loadMove(mymove)
        }
      }
      return arr
    }
    if (this.$route.query.fight) {
      addToArr(idleMapper)
      addToArr(kickMapper)
      addToArr(boxingMapper)
      addToArr(superheroMapper)
      addToArr(boxinghitMapper)
      addToArr(locomotionMapper)
    } else {
      addToArr(thrillerMapper)
      addToArr(breakdancesMapper)
      addToArr(danceingMapper)
      addToArr(gestureMapper)
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

        // run: {
        //   // ry: Math.PI * -0.25,
        //   sx: 1,
        //   sy: 1,
        //   sz: 1,
        //   // pz: -100,
        //   // rx: Math.PI * 0.05 + Math.PI

        //   // pz: -250,
        //   // px: -2250,
        //   // ry: Math.PI * 0.15,
        // },

        correctAxis: {
          rz: Math.PI * 0.5,
          rx: Math.PI * -0.5
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

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, ny: 0, y: 1 }, onMove: () => {} })
    let hscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'horizontal', canRun: true, ny: -1, y: 1 }, onMove: () => {} })

    this.viewCameraMode = 'chase'
    // placeholder value only, will be replaced
    this.viewSettings = {
      adjustX: 0,
      adjustY: 0,
      adjustZ: 0,
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
    let guyBodyPos = new Vector3()

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
        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 70

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.farest = 900,
        this.viewSettings.defaultCloseup = 0
      } else if (this.viewCameraMode === 'back') {
        // this.viewSettings.adjustX = 0
        // this.viewSettings.adjustY = 1.936
        // this.viewSettings.adjustZ = -48.562

        // this.viewSettings.cameraExtraHeight = 100.774
        // this.viewSettings.farest = 900,
        // this.viewSettings.defaultCloseup = 31.717

        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = -14.9336
        this.viewSettings.adjustZ = -10.3706

        this.viewSettings.cameraExtraHeight = 118.363
        this.viewSettings.farest = 900,
        this.viewSettings.defaultCloseup = 233.912
      } else if (this.viewCameraMode === 'chase') {
        this.viewSettings.adjustX = -123.7555
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 3.982
        this.viewSettings.defaultCloseup = 492.46 + 24.6128
        this.viewSettings.farest = 900
      } else if (this.viewCameraMode === 'close') {
        // this.viewSettings.adjustX = -92.229
        // this.viewSettings.adjustY = -38.4403
        // this.viewSettings.adjustZ = 146.5708

        // this.viewSettings.cameraExtraHeight = 79.978
        // this.viewSettings.defaultCloseup = 80.991
        // this.viewSettings.farest = 900

        this.viewSettings.adjustX = -147.9535
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 162.6106

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.defaultCloseup = -48.425
        this.viewSettings.farest = 900
      }
    }
    this.$watch('viewCameraMode', () => {
      resetCam()
    })
    this.$on('resetCam', (v = 'chase') => {
      this.viewCameraMode = v
    })
    resetCam()
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
      let scrollZoom = config.farest * progress * (this.viewCameraMode === 'static' ? 0 : 1)
      let extraZoom = config.defaultCloseup + scrollZoom

      if (this.guy && this.guyHead && this.guyFace && this.guyBack) {
        // getting position
        // this.guy.rotation.y = Math.PI * -0.25
        this.guy.getWorldPosition(centerPosition)

        if (this.viewCameraMode === 'face') {
          this.guyFace.position.x = config.adjustX
          this.guyFace.position.y = config.adjustY
          this.guyFace.position.z = config.adjustZ
        }

        if (this.viewCameraMode === 'back') {
          this.guyBack.position.x = config.adjustX
          this.guyBack.position.y = config.adjustY
          this.guyBack.position.z = config.adjustZ
        }

        if (this.viewCameraMode === 'chase') {
          centerPosition.x += config.adjustX
          centerPosition.y += config.adjustY
          centerPosition.z += config.adjustZ
        }

        if (this.viewCameraMode === 'close') {
          centerPosition.x += config.adjustX
          centerPosition.y += config.adjustY
          centerPosition.z += config.adjustZ
        }

        // looker (guyFace)
        headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
        guyBodyPos.setFromMatrixPosition(this.guy.matrixWorld)
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

          targetLookAt.x = guyBodyPos.x
          targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
          targetLookAt.z = guyBodyPos.z
        } else if (this.viewCameraMode === 'close') {
          // make use of position
          targetCamPos.x = centerPosition.x
          targetCamPos.y = centerPosition.y + config.cameraExtraHeight
          targetCamPos.z = centerPosition.z + extraZoom

          targetLookAt.x = guyBodyPos.x
          targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
          targetLookAt.z = guyBodyPos.z
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
        } else if (this.viewCameraMode === 'close') {
          lerperLookAt.lerp(targetLookAt, 0.05)
          lerperCamPos.lerp(targetCamPos, 0.05)
        }

        if (this.viewCameraMode === 'static') {
          this.controls.enabled = true
          this.controls.update()
        } else {
          this.controls.enabled = false
          camera.lookAt(lerperLookAt)
          camera.position.copy(lerperCamPos)
        }
      }
    })

    this.$on('move-end', (move) => {
      // console.log(move)
      this.guy.getWorldPosition(centerPosition)
      if (move.displayName === 'Warming Up') {
        this.pickMove({ chosenMove: this.moves.find(e => e.displayName === 'Taunt'), autoFocusDIV: true })
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

    await this.chooseDefaultDanceMove()

    let clock = new Clock()
    let counter = 0
    this.lookup('base').onLoop(() => {
      let delta = clock.getDelta()
      if (delta > 0.001 * 16.6667 * 5) {
        counter++
      }
      if (counter >= 60) {
        this.useBloom = false
      }
    })
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
