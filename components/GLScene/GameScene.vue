<template>
  <O3D>

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

      <!-- <O3D :animated="true" layout="holycross" :visible="charReady">
        <HolyCross :visible="charReady"></HolyCross>
      </O3D> -->

      <O3D :animated="true" layout="charmover" :visible="charReady">
        <O3D :animated="true" layout="calibration">
          <O3D :animated="true" layout="center">
            <O3D :animated="true" layout="correctAxis">
              <SwatRiggedModel @removeGLTF="removeGLTF({ gltf: $event })" @setupGLTF="setupGLTF({ gltf: $event })" @guy="guy = $event;" @guyHead="guyHead = $event;" @guyBack="guyBack = $event" @guyFace="guyFace = $event" @guySkeleton="guySkeleton = $event" :shaderCube="shaderCube"></SwatRiggedModel>
            </O3D>
          </O3D>
        </O3D>
      </O3D>
    </O3D>

    <div class="select-none absolute top-0 left-0 w-full h-full" ref="domlayer">
    </div>

    <div v-if="charReady && showActionBox && moves" class="select-none absolute z-20 top-0 left-0 text-white w-56 overflow-y-auto moves-box">
      <a :ref="`item-${moveItem._id}`" v-for="moveItem in moves" :key="moveItem._id + moveItem.displayName" @click="$emit('play-move', { move: moveItem }); lastClickedMove = moveItem" class="block px-2 mx-1 my-1 border-gray-100 border" :style="{ backgroundColor: lastClickedMove === moveItem ? '#4299e1' : 'rgba(0,0,0,0.2)' }">{{ moveItem.displayName }}</a>
    </div>

    <div class="select-none absolute top-0 left-0 w-full h-full flex justify-center items-center" v-show="!charReady" :style="{ backgroundColor: !charReady ? `rgba(0,0,0,0.6)` : '' }" >
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white">
        <span>Loading... {{ (loadProgress * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <div class="select-none absolute z-10 bottom-0 left-0 p-3 pb-16" v-if="charReady">
      <div class="block text-center select-none px-2 mx-1 my-1 mb-5 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('go-forward', true)" @mousedown="$emit('go-forward', true)"  @touchend="$emit('go-forward', false)" @mouseup="$emit('go-forward', false)">
        Forward
      </div>
      <div class="block text-center select-none px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('go-backward', true)" @mousedown="$emit('go-backward', true)" @touchend="$emit('go-backward', false)" @mouseup="$emit('go-backward', false)">
        Backward
      </div>
    </div>

    <div class="select-none absolute z-10 bottom-0 right-0 p-3 pb-16" v-if="charReady && !useGyro">
      <div class="block text-center select-none px-2 mx-1 my-1 mb-5 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('turn-left', true)" @mousedown="$emit('turn-left', true)"  @touchend="$emit('turn-left', false)" @mouseup="$emit('turn-left', false)">
        Turn Left
      </div>
      <div class="block text-center select-none px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('turn-right', true)" @mousedown="$emit('turn-right', true)" @touchend="$emit('turn-right', false)" @mouseup="$emit('turn-right', false)">
        Turn Right
      </div>
    </div>

    <div class="select-none absolute z-10 bottom-0 right-0 p-3 pb-16" v-if="charReady && useGyro">
      <div class="block text-center select-none px-2 mx-1 my-1 mb-5 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('go-left', true)" @mousedown="$emit('go-left', true)"  @touchend="$emit('go-left', false)" @mouseup="$emit('go-left', false)">
        Go Left
      </div>
      <div class="block text-center select-none px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white" @touchstart="$emit('go-right', true)" @mousedown="$emit('go-right', true)" @touchend="$emit('go-right', false)" @mouseup="$emit('go-right', false)">
        Go Right
      </div>
    </div>

    <div class="absolute z-10 top-0 right-0 p-3" v-if="charReady">

      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'firstperson', 'border-green-200': viewCameraMode === 'firstperson' }" @click="viewCameraMode = 'firstperson'">Personal Camera</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'firstback', 'border-green-200': viewCameraMode === 'firstback' }" @click="viewCameraMode = 'firstback'">Personal Back</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'firstface', 'border-green-200': viewCameraMode === 'firstface' }" @click="viewCameraMode = 'firstface'">Personal Face</div>

      <div class="h-3"></div>

      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'chase', 'border-green-200': viewCameraMode === 'chase' }" @click="viewCameraMode = 'chase'">Observe Character</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'close', 'border-green-200': viewCameraMode === 'close' }" @click="viewCameraMode = 'close'">Closeup Character</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'eye', 'border-green-200': viewCameraMode === 'eye' }" @click="viewCameraMode = 'eye'">Eye Character</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'face', 'border-green-200': viewCameraMode === 'face' }" @click="viewCameraMode = 'face'">Facing Head</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-green-200': viewCameraMode === 'behind', 'border-green-200': viewCameraMode === 'behind' }" @click="viewCameraMode = 'behind'">Behind Head</div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-red-500': useGyro, 'border-red-500': useGyro }" v-if="hasGyro" @click="setupGyroCam">
        <span v-if="!useGyro">Try AR/XR Mode</span>
        <span v-if="useGyro">Using AR/XR Mode</span>
      </div>
      <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center" :class="{ 'text-yellow-500': useBloom === true, 'border-yellow-500': useBloom === true }" @click="useBloom = !useBloom">Bloom Light</div>

      <div class="h-3"></div>

      <div v-if="isDev" class="">
        <div class="select-none text-white block px-2 mx-1 my-1 border-gray-100 border text-20 text-center cursor-pointer" :class="{ 'text-yellow-200': true, 'border-yellow-200': true }" @click="copyText">copyText</div>

        <div>
          <div class="select-none text-xs text-white">
            adjustX
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustX">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustX += 25" @keydown.down="viewSettings.adjustX -= 25" v-model="viewSettings.adjustX">
          </div>
        </div>
        <div>
          <div class="select-none text-xs text-white">
            adjustY
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustY">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustY += 25" @keydown.down="viewSettings.adjustY -= 25" v-model="viewSettings.adjustY">
          </div>
        </div>
        <div>
          <div class="select-none text-xs text-white">
            adjustZ
          </div>
          <div>
            <input type="range" min="-500" step="0.0001" max="500" v-model="viewSettings.adjustZ">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.adjustZ += 25" @keydown.down="viewSettings.adjustZ -= 25" v-model="viewSettings.adjustZ">
          </div>
        </div>
        <div>
          <div class="select-none text-xs text-white">
            cameraExtraHeight
          </div>
          <div>
            <input type="range" min="-200" step="0.001" max="200" v-model="viewSettings.cameraExtraHeight">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.cameraExtraHeight += 25" @keydown.down="viewSettings.cameraExtraHeight -= 25" v-model="viewSettings.cameraExtraHeight">
          </div>
        </div>

        <div>
          <div class="select-none text-xs text-white">
            defaultCloseup
          </div>
          <div>
            <input type="range" min="-1024" step="0.001" max="1024" v-model="viewSettings.defaultCloseup">
            <input type="number" step="1" class="w-8 text-black px-1" @keydown.up="viewSettings.defaultCloseup += 25" @keydown.down="viewSettings.defaultCloseup -= 25" v-model="viewSettings.defaultCloseup">
          </div>
        </div>

        <div v-if="Bloom">
          <div class="select-none text-xs text-white">
            Bloom.threshold
          </div>
          <div>
            <input type="range" min="0" step="0.00001" max="1" v-model="Bloom.threshold">
            <input type="number" step="0.00001" class="w-8 text-black px-1" @keydown.up="Bloom.threshold += 0.1" @keydown.down="Bloom.threshold -= 0.1" v-model="Bloom.threshold">
          </div>
        </div>

      </div>
    </div>

    <!-- <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center" v-show="displayStartMenu" :style="{ backgroundColor: displayStartMenu ? `rgba(0,0,0,0.6)` : '' }" >
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white cursor-pointer" v-if="!!charReady && !entered" @click="setupControls();">
        Start Game
      </div>
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white" v-if="!!charReady && entered" @click="controls.lock()">
        Resume Game
      </div>
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white" v-if="!charReady">
        <span>Loading... {{ loadProgress.toFixed(1) }}%</span>
      </div>
    </div>
    <div class="absolute top-0 left-0 p-3" v-if="!displayStartMenu">
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white">ESC to Exit</div>
    </div> -->
  </O3D>
</template>

<script>
import { makeScroller, Tree, PCamera, ShaderCubeChrome, getID } from '../Reusable'
import { Scene, Color, Clock, DefaultLoadingManager, Vector3, Raycaster, Object3D, AnimationMixer, LoopOnce } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import copy2clip from 'copy-to-clipboard'

const TWEEN = require('@tweenjs/tween.js').default

// import { Interaction } from 'three.interaction'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// let Cache = {}

export default {
  name: 'ThankYouGospelGameScene',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
      showActionBox: true,
      lastClickedMove: false,
      hasGyro: true,
      isMobile: window.innerWidth < 500,
      Bloom: false,
      isDev: process.env.NODE_ENV === 'development',
      controls: false,
      charmover: new Object3D(),
      controlTarget: new Object3D(),
      // face vs chase
      viewCameraMode: 'firstperson',
      viewSettings: {},

      charReady: false,
      guyGLTF: false,
      displayStartMenu: true,

      loadingManager: false,
      loadProgress: 0,

      activeLog: [],
      isTakingComplexAction: false,

      useGyro: false,

      // guy
      guy: false,
      guyHead: false,
      guyBack: false,
      guyFace: false,
      guySkeleton: false,

      moves: false,
      Math,
      shaderCube: false,
      settings: {},
      flower1: {},
      image: false,
      scene: new Scene(),
      tCube: false,
      layouts: false,
      useBloom: true,

      // blur: 0,
      // socket: false,
      // entered: false
    }
  },
  methods: {
    // detectGyro () {
    //   this.hasGyro = false
    //   window.addEventListener('devicemotion', (event) => {
    //     if(event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma) {
    //       this.hasGyro = true
    //     }
    //   })
    // },
    click () {
      console.log('123')
    },
    removeGLTF ({ gltf }) {
      this.guyGLTF = false
    },
    async setupGLTF ({ gltf }) {
      this.guyGLTF = gltf
      await this.setupChar()
    },
    async setupChar () {
      console.log('here____')
      await this.setupMovesDB()
      await this.setupAnimationSystem()
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
    async setupMovesDB () {
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
      // let gestureMapper = require('../GLContent/Swat/gesture/fbx').default
      // let locomotionMapper = require('../GLContent/Swat/locomotion/fbx').default
      // let thrillerMapper = require('../GLContent/Swat/thriller/fbx').default
      // let breakdancesMapper = require('../GLContent/Swat/breakdance/fbx').default
      // let danceingMapper = require('../GLContent/Swat/dancing/fbx').default
      // let capoeiraMapper = require('../GLContent/Swat/capoeira/fbx').default
      // let kickMapper = require('../GLContent/Swat/kick/fbx').default
      // let boxingMapper = require('../GLContent/Swat/boxing/fbx').default
      // let boxinghitMapper = require('../GLContent/Swat/boxinghit/fbx').default
      // let idleMapper = require('../GLContent/Swat/idle/fbx').default
      // let superheroMapper = require('../GLContent/Swat/superhero/fbx').default

      let controlMapper = require('../GLContent/Swat/controls/fbx').default
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
      let prayerMapper = require('../GLContent/Swat/prayer/fbx').default
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
        let waiters = []
        if (preload) {
          for (let mymove of arr) {
            waiters.push(this.loadMove(mymove))
          }
        }
        await Promise.all(waiters)
        return arr
      }

      // addToArr(idleMapper)
      // await addToArr(controlMapper, true)
      // addToArr(kickMapper)
      // addToArr(boxingMapper)
      // addToArr(superheroMapper)
      // addToArr(boxinghitMapper)
      // addToArr(locomotionMapper)
      // addToArr(gestureMapper)
      // addToArr(thrillerMapper)
      // addToArr(breakdancesMapper)
      // addToArr(danceingMapper)

      addToArr(prayerMapper)
      addToArr(controlMapper)
      addToArr(idleMapper)
      addToArr(kneeMapper)
      addToArr(kickMapper)
      addToArr(boxingMapper)
      addToArr(mmaMapper)
      addToArr(superheroMapper)
      addToArr(boxinghitMapper)
      addToArr(hurtMapper)
      addToArr(locomotionMapper)
      addToArr(capoeiraMapper)
      addToArr(thrillerMapper)
      addToArr(breakdancesMapper)
      addToArr(danceingMapper)
      addToArr(rifleMapper)
      addToArr(gestureMapper)

      this.moves = movesOrig
      /* Moves End */
    },
    async prepMixer ({ actor }) {
      var mixer = new AnimationMixer(actor)
      let clock = new Clock
      this.lookup('base').onLoop(() => {
        let dt = clock.getDelta()
        TWEEN.update()
        mixer.update(dt)
      })
      return mixer
    },
    prepAnimation ({ pose, mixer, inPlace }) {
      if (pose && !pose.animations) {
        return Promise.reject()
      }
      return new Promise((resolve) => {
        let action = false
        pose.animations.forEach((clip) => {
          if (inPlace) {
            // console.log(clip)
            if (clip.tracks[0] && clip.tracks[0].name === 'mixamorigHips.position') {
              let values = clip.tracks[0].values
              for (var i = 0; i < values.length; i += 3) {
                values[i + 0] = 0
                // values[i + 1] = 0
                values[i + 2] = 0
              }
            }
          }

          action = mixer.clipAction(clip)
          action.duration = clip.duration
          action.mixer = mixer
          resolve(action)
        });
      })
    },
    async loadMoveByName ({ name }) {
      let move = this.moves.find(e => e.displayName === name)
      if (!move) {
        console.log('cannot find ... ' + name)
      }
      let moveObj = await this.loadMove(move)
      return moveObj
    },
    async getActionByDisplayName ({ inPlace, name, mixer }) {
      let moveObj = await this.loadMoveByName({ name })
      let actionObj = await this.prepAnimation({ inPlace, pose: moveObj.actionFBX, mixer })
      return actionObj
    },

    setWeight (action, weight) {
      action.enabled = true
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(weight)
    },
    copyText () {
      copy2clip(`
          this.viewSettings.adjustX = ${this.viewSettings.adjustX.toFixed(5)}
          this.viewSettings.adjustY = ${this.viewSettings.adjustY.toFixed(5)}
          this.viewSettings.adjustZ = ${this.viewSettings.adjustZ.toFixed(5)}

          this.viewSettings.cameraExtraHeight = ${this.viewSettings.cameraExtraHeight.toFixed(5)}
          this.viewSettings.farest = ${this.viewSettings.farest.toFixed(5)}
          this.viewSettings.defaultCloseup = ${this.viewSettings.defaultCloseup.toFixed(5)}
      `)
    },
    async setupCameraSystem () {
      var moveForward = false
			var moveBackward = false
			var moveLeft = false
			var moveRight = false
			var canJump = false
			var turnLeft = false
      var turnRight = false

      let speedScale = 4

			var prevTime = performance.now()
			var velocity = new Vector3()
      var direction = new Vector3()

      this.controlTarget.position.x = 0
      this.controlTarget.position.y = 0
      this.controlTarget.position.z = 1980

      this.controlTarget.rotateY

      let camPlacer = new Object3D()
      let camPlacerVec3 = new Vector3()


      let charPlacer = new Object3D()
      let charPlacerVec3 = new Vector3()
      charPlacer.position.y = 0
      charPlacer.position.z = 0

      this.controlTarget.add(camPlacer)
      this.controlTarget.add(charPlacer)

      let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, ny: 0, y: 1 }, onMove: () => {} })

      var onKeyDown = (event) => {

        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = true;
            break;

          case 37: // left
          case 65: // a
            moveLeft = true;
            break;

          case 40: // down
          case 83: // s
            moveBackward = true;
            break;

          case 39: // right
          case 68: // d
            moveRight = true;
            break;

          case 32: // space
            canJump = false;
            break;

          case 81: // q
            turnLeft = true
            break;

          case 69: // e
            turnRight = true
            break;
        }
      };

      var onKeyUp = (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = false;
            break;

          case 37: // left
          case 65: // a
            moveLeft = false;
            break;

          case 40: // down
          case 83: // s
            moveBackward = false;
            break;

          case 39: // right
          case 68: // d
            moveRight = false;
            break;

          case 81: // q
            turnLeft = false
            break;


          case 69: // e
            turnRight = false
            break;
        }
      };

      this.$on('go-forward', (v) => {
        moveForward = v
      })
      this.$on('go-backward', (v) => {
        moveBackward = v
      })

      this.$on('go-left', (v) => {
        if (v) {
          onKeyDown({ keyCode: 65 })
        } else {
          onKeyUp({ keyCode: 65 })
        }
      })

      this.$on('go-right', (v) => {
        if (v) {
          onKeyDown({ keyCode: 68 })
        } else {
          onKeyUp({ keyCode: 68 })
        }
      })

      this.$on('turn-left', (v) => {
        if (v) {
          onKeyDown({ keyCode: 81 })
        } else {
          onKeyUp({ keyCode: 81 })
        }
      })
      this.$on('turn-right', (v) => {
        if (v) {
          onKeyDown({ keyCode: 69 })
        } else {
          onKeyUp({ keyCode: 69 })
        }
      })


      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
      // raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, 10 );

      // this.camera.position.z = 500

      let lookAtVec3 = new Vector3()
      let lookAtLerpVec3 = new Vector3()

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

      let resetCam = () => {
        vscroll.value = 0
        if (this.viewCameraMode === 'behind') {
          this.viewSettings.adjustX = 0
          this.viewSettings.adjustY = 0
          this.viewSettings.adjustZ = -70

          this.viewSettings.cameraExtraHeight = 0
          this.viewSettings.farest = 900
          this.viewSettings.defaultCloseup = 0
        } else if (this.viewCameraMode === 'face') {
          this.viewSettings.adjustX = 0
          this.viewSettings.adjustY = 0
          this.viewSettings.adjustZ = 70

          this.viewSettings.cameraExtraHeight = 0
          this.viewSettings.farest = 900
          this.viewSettings.defaultCloseup = 0
        } else if (this.viewCameraMode === 'chase') {
          this.viewSettings.adjustX = -123.7555
          this.viewSettings.adjustY = 0
          this.viewSettings.adjustZ = 0

          this.viewSettings.cameraExtraHeight = 3.982
          this.viewSettings.defaultCloseup = 492.46 + 24.6128
          this.viewSettings.farest = 900
        } else if (this.viewCameraMode === 'close') {
          this.viewSettings.adjustX = -147.9535
          this.viewSettings.adjustY = 0
          this.viewSettings.adjustZ = -195.1051

          this.viewSettings.cameraExtraHeight = 0
          this.viewSettings.defaultCloseup = -48.425
          this.viewSettings.farest = 900
        } else if (this.viewCameraMode === 'firstperson') {
          this.viewSettings.adjustX = 0
          this.viewSettings.adjustY = 177.2677
          this.viewSettings.adjustZ = 200.2212

          this.viewSettings.cameraExtraHeight = 21.792
          this.viewSettings.defaultCloseup = 263.363
          this.viewSettings.farest = 900
        } else if (this.viewCameraMode === 'firstback') {
          this.viewSettings.adjustX = 0.00000
          this.viewSettings.adjustY = 70.51990
          this.viewSettings.adjustZ = 0.00000

          this.viewSettings.cameraExtraHeight = 0.00000
          this.viewSettings.farest = 900.00000
          this.viewSettings.defaultCloseup = 122.90300
        } else if (this.viewCameraMode === 'firstface') {
          this.viewSettings.adjustX = 0.00000
          this.viewSettings.adjustY = 70.51990
          this.viewSettings.adjustZ = 0.00000

          this.viewSettings.cameraExtraHeight = 0.00000
          this.viewSettings.farest = 900.00000
          this.viewSettings.defaultCloseup = -153.77
        } else if (this.viewCameraMode === 'eye') {
          this.viewSettings.adjustX = 0.00000
          this.viewSettings.adjustY = 70.51990
          this.viewSettings.adjustZ = 0.00000

          this.viewSettings.cameraExtraHeight = 0.00000
          this.viewSettings.farest = 900.00000
          this.viewSettings.defaultCloseup = 86.93800
        }
      }

      resetCam()
      this.$watch('viewCameraMode', resetCam)
      let updateO3D = (o3d) => {
        o3d.updateMatrix()
        o3d.updateMatrixWorld()
        o3d.updateWorldMatrix()
      }
      this.lookup('base').onLoop(() => {
        if (!this.charReady) { return }
        var time = performance.now()
        var delta = (time - prevTime) / 1000
        prevTime = time;

        // update control target
        if (turnLeft) {
          this.controlTarget.rotation.y += delta * 1.75
        }
        if (turnRight) {
          this.controlTarget.rotation.y -= delta * 1.75
        }
        if (!this.isTakingComplexAction) {
          if (moveForward) {
            this.controlTarget.translateZ(-delta * 700)
          }
          if (moveBackward) {
            this.controlTarget.translateZ(delta * 700)
          }
          if (moveLeft) {
            this.controlTarget.translateX(-delta * 700)
          }
          if (moveRight) {
            this.controlTarget.translateX(delta * 700)
          }
        }

        updateO3D(this.controlTarget)
        // this.controlTarget.updateMatrix()
        // this.controlTarget.updateMatrixWorld()
        // this.controlTarget.updateWorldMatrix()

        // sync control target to character
        charPlacerVec3.setFromMatrixPosition(charPlacer.matrixWorld)
        this.charmover.rotation.x = this.controlTarget.rotation.x
        this.charmover.rotation.y = this.controlTarget.rotation.y
        this.charmover.rotation.z = this.controlTarget.rotation.z

        this.charmover.position.x = charPlacerVec3.x
        this.charmover.position.y = charPlacerVec3.y
        this.charmover.position.z = charPlacerVec3.z

        // can calculate camera
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
        if (this.guy) {
          this.guy.getWorldPosition(centerPosition)
        }

        if (this.viewCameraMode === 'face') {
          this.guyFace.position.x = config.adjustX
          this.guyFace.position.y = config.adjustY
          this.guyFace.position.z = config.adjustZ
        }

        if (this.viewCameraMode === 'behind') {
          this.guyFace.position.x = config.adjustX
          this.guyFace.position.y = config.adjustY
          this.guyFace.position.z = config.adjustZ
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

        if (this.viewCameraMode === 'eye') {
          centerPosition.x += config.adjustX
          centerPosition.y += config.adjustY
          centerPosition.z += config.adjustZ
        }

        if (this.viewCameraMode === 'firstperson') {
          camPlacer.position.x = config.adjustX
          camPlacer.position.y = config.adjustY
          camPlacer.position.z = config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }
        if (this.viewCameraMode === 'firstback') {
          camPlacer.position.x = config.adjustX
          camPlacer.position.y = config.adjustY
          camPlacer.position.z = config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }
        if (this.viewCameraMode === 'firstface') {
          camPlacer.position.x = config.adjustX
          camPlacer.position.y = config.adjustY
          camPlacer.position.z = config.adjustZ + config.defaultCloseup - vscroll.value * config.farest
        }


        if (this.guyHead && this.guy && this.guyFace && this.guyBack) {
          updateO3D(this.guyHead)
          updateO3D(this.guy)
          updateO3D(this.guyFace)
          updateO3D(this.guyBack)
          updateO3D(camPlacer)

          headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
          guyBodyPos.setFromMatrixPosition(this.guy.matrixWorld)
          guyEyePos.setFromMatrixPosition(this.guyFace.matrixWorld)
          guyBackPos.setFromMatrixPosition(this.guyBack.matrixWorld)

          camPlacerVec3.setFromMatrixPosition(camPlacer.matrixWorld)
          lookAtVec3.setFromMatrixPosition(this.guyBack.matrixWorld)
        }

        let progress = vscroll.value
        let scrollZoom = config.farest * progress * 1
        let extraZoom = config.defaultCloseup + scrollZoom

        if (this.viewCameraMode === 'behind') {
          // make use of position
          targetCamPos.x = guyEyePos.x
          targetCamPos.y = guyEyePos.y + config.cameraExtraHeight
          targetCamPos.z = guyEyePos.z + extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        } else if (this.viewCameraMode === 'face') {
          // make use of position
          targetCamPos.x = guyEyePos.x
          targetCamPos.y = guyEyePos.y + config.cameraExtraHeight
          targetCamPos.z = guyEyePos.z - extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        } else if (this.viewCameraMode === 'eye') {
          // make use of position
          targetCamPos.x = guyEyePos.x
          targetCamPos.y = guyEyePos.y + config.cameraExtraHeight
          targetCamPos.z = guyEyePos.z - extraZoom

          targetLookAt.x = headPosition.x
          targetLookAt.y = headPosition.y - config.cameraExtraHeight
          targetLookAt.z = headPosition.z
        } else if (this.viewCameraMode === 'chase') {
          // make use of position
          targetCamPos.x = centerPosition.x
          targetCamPos.y = centerPosition.y + config.cameraExtraHeight
          targetCamPos.z = centerPosition.z - extraZoom

          targetLookAt.x = guyBodyPos.x
          targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
          targetLookAt.z = guyBodyPos.z
        } else if (this.viewCameraMode === 'close') {
          // make use of position
          targetCamPos.x = centerPosition.x
          targetCamPos.y = centerPosition.y + config.cameraExtraHeight
          targetCamPos.z = centerPosition.z - extraZoom

          targetLookAt.x = guyBodyPos.x
          targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
          targetLookAt.z = guyBodyPos.z
        } else if (this.viewCameraMode === 'firstperson') {
          // make use of position
          targetCamPos.x = camPlacerVec3.x
          targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
          targetCamPos.z = camPlacerVec3.z

          targetLookAt.x = lookAtVec3.x
          targetLookAt.y = lookAtVec3.y - config.cameraExtraHeight
          targetLookAt.z = lookAtVec3.z
        } else if (this.viewCameraMode === 'firstback') {
          // make use of position
          targetCamPos.x = camPlacerVec3.x
          targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
          targetCamPos.z = camPlacerVec3.z

          targetLookAt.x = guyEyePos.x
          targetLookAt.y = guyEyePos.y - config.cameraExtraHeight
          targetLookAt.z = guyEyePos.z
        } else if (this.viewCameraMode === 'firstface') {
          // make use of position
          targetCamPos.x = camPlacerVec3.x
          targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
          targetCamPos.z = camPlacerVec3.z

          targetLookAt.x = guyEyePos.x
          targetLookAt.y = guyEyePos.y - config.cameraExtraHeight
          targetLookAt.z = guyEyePos.z
        }

        if (this.viewCameraMode === 'behind') {
          lerperLookAt.lerp(targetLookAt, 0.2)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'eye') {
          lerperLookAt.lerp(targetLookAt, 0.2)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'chase') {
          lerperLookAt.lerp(targetLookAt, 0.05)
          lerperCamPos.lerp(targetCamPos, 0.05)
        } else if (this.viewCameraMode === 'close') {
          lerperLookAt.lerp(targetLookAt, 0.05)
          lerperCamPos.lerp(targetCamPos, 0.05)
        } else if (this.viewCameraMode === 'firstperson') {
          lerperLookAt.lerp(targetLookAt, 1)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'firstback') {
          lerperLookAt.lerp(targetLookAt, 1)
          lerperCamPos.lerp(targetCamPos, 0.2)
        } else if (this.viewCameraMode === 'firstface') {
          lerperLookAt.lerp(targetLookAt, 1)
          lerperCamPos.lerp(targetCamPos, 0.2)
        }

        this.camera.lookAt(targetLookAt)
        this.camera.position.copy(targetCamPos)
      })

      this.lookup('base').onLoop(() => {
        this.layouts = {
          walk: {
            sx: 5.5,
            sy: 5.5,
            sz: 5.5,
            pz: 800 * 5.5,
            py: 1157
          },
          // bg: {
          //   // pz: -400,
          //   sx: 2,
          //   sy: 2,
          //   sz: 1,
          //   py: -180,
          //   rx: Math.PI * 0.5
          // },
          charmover: {
            px: this.charmover.position.x,
            py: this.charmover.position.y,
            pz: this.charmover.position.z,
            rx: this.charmover.rotation.x,
            ry: this.charmover.rotation.y,
            rz: this.charmover.rotation.z
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

          calibration: {
            ry: Math.PI
          },
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
            // pz: 100
          }
        }
      })
    },
    async doMany ({ idle, to, mixer, stopAll = true }) {
      return new Promise((resolve) => {
        if (to.isRunning()) {
          resolve()
          return
        }
        if (stopAll) {
          mixer.stopAllAction()
        }
        to.reset()

        to.enabled = true
        // to.repetitions = 1
        // to.clampWhenFinished = true
        to.reset().play()

        setTimeout(() => {
          resolve()
        }, to.duration * 1000)
      })
    },
    async doOnce ({ idle, to, mixer, stopAll = true }) {
      return new Promise((resolve) => {
        if (to.isRunning()) {
          resolve()
          return
        }
        if (stopAll) {
          mixer.stopAllAction()
        }
        idle.reset()
        to.reset()

        let fade = 0.3

        to.enabled = true
        idle.enabled = true

        to.repetitions = 1
        to.clampWhenFinished = true
        to.reset().play()

        idle.crossFadeTo(to, fade * to.duration, false)

        let onEnd = () => {
          let idx = this.activeLog.indexOf(to)
          if (idx !== -1) {
            this.activeLog.splice(idx, 1)
          }

          let remain = this.activeLog[0]
          if (remain) {
            idle.fadeOut(to.duration * fade)
            idle = remain
          }

          idle.crossFadeFrom(to, fade * to.duration, false)
          idle.enabled = true
          idle.play()
        }

        // let hh = (to) => {
        //   if (ev.action === to) {
        //     mixer.addEventListener('finished', hh)
        //     onEnd()
        //   }
        // }
        // mixer.addEventListener('finished', hh)

        clearTimeout(this.doOnceTimeout)
        this.doOnceTimeout = setTimeout(() => {
          onEnd()
        }, to.duration * 1000 * (1.0 - fade))

        setTimeout(() => {
          resolve()
        }, to.duration * 1000)
      })
    },
    async doStart ({ idle, to, mixer, canRestore = false, stopAll = true }) {
      return new Promise((resolve, reject) => {
        if (to.isRunning()) {
          resolve(false)
          return
        }
        if (stopAll) {
          mixer.stopAllAction()
        }
        idle.reset()
        to.reset()

        let fade = 0.3

        to.enabled = true
        idle.enabled = true

        to.repetitions = Infinity
        to.clampWhenFinished = true
        to.reset().play()

        this.activeLog.push(to)

        idle.crossFadeTo(to, fade * to.duration, false)
        resolve(true)
      })
    },
    async doEnd ({ idle, to, mixer }) {
      return new Promise((resolve) => {
        let fade = 0.3

        let idx = this.activeLog.indexOf(to)
        if (idx !== -1) {
          this.activeLog.splice(idx, 1)
        }

        let remain = this.activeLog[0]
        if (remain) {
          idle.fadeOut(to.duration * fade)
          idle = remain
        }

        idle.crossFadeFrom(to, fade * to.duration, false)
        idle.enabled = true
        idle.play()
      })
    },
    async setupAnimationSystem () {
      let moves = this.moves
      let mixer = await this.prepMixer({ actor: this.guyGLTF.scene })

      let parallelPreload = async () => {
        let arr = [
          'Mma Idle',
          // 'Northern Soul Floor Combo',
          'jump',

          'running',
          'control run backwards',

          'left strafe',
          'right strafe',

          'control turn left a bit',
          'control turn right a bit',

          'Warming Up',

          'Speedbag'
          // 'Hip Hop Dancing (3) copy'
        ]
        let waiters = []
        for (let name of arr) {
          waiters.push(this.loadMoveByName({ name }))
        }
        await Promise.all(waiters)
      }
      await parallelPreload()

      let idle = await this.getActionByDisplayName({ name: 'Mma Idle', mixer })
      // let tauntTimerHand = await this.getActionByDisplayName({ name: 'Taunt (1)', mixer })

      // let victory = await this.getActionByDisplayName({ name: 'a1-Victory', mixer })

      let skillAction1 = await this.getActionByDisplayName({ name: 'Warming Up', mixer })
      let skillAction2 = await this.getActionByDisplayName({ name: 'Speedbag', mixer })

      let jump = await this.getActionByDisplayName({ inPlace: true, name: 'jump', mixer })
      let running = await this.getActionByDisplayName({ inPlace: true, name: 'running', mixer })
      let runningBack = await this.getActionByDisplayName({ inPlace: true, name: 'control run backwards', mixer })

      let leftStrafe = await this.getActionByDisplayName({ inPlace: true, name: 'left strafe', mixer })
      let rightStrafe = await this.getActionByDisplayName({ inPlace: true, name: 'right strafe', mixer })

      // let goForward = await this.getActionByDisplayName({ inPlace: true, name: 'control go forward', mixer })
      // let goBackward = await this.getActionByDisplayName({ inPlace: true, name: 'control go backward', mixer })
      // let goLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control go left', mixer })
      // let goRight = await this.getActionByDisplayName({ inPlace: true, name: 'control go right', mixer })

      let turnLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control turn left a bit', mixer })
      let turnRight = await this.getActionByDisplayName({ inPlace: true, name: 'control turn right a bit', mixer })

      idle.play()

      this.$on('play-move', async ({ move, cb = () => {} }) => {
        this.isTakingComplexAction = true
        let action = await this.getActionByDisplayName({ name: move.displayName, mixer })
        await this.doMany({ idle, to: action, mixer, stopAll: true }).catch(() => {
          this.isTakingComplexAction = false
        })
        this.isTakingComplexAction = false
        cb()
      })

      this.viewCameraMode = 'face'
      this.$emit('play-move', { move: { displayName: 'Warming Up' }, cb: () => {} })

      // setTimeout(async () => {
      //   this.viewCameraMode = 'close'
      //   await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log(e))
      //   this.viewCameraMode = 'firstperson'
      // })

      this.charReady = true

      let moveForward, moveLeft, moveRight, moveBackward = false
      var onKeyDown = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: running, mixer })
            break;

          case 37: // left
          case 65: // a
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: leftStrafe, mixer })
            break;

          case 40: // down
          case 83: // s
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: runningBack, mixer })
            break;

          case 39: // right
          case 68: // d
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: rightStrafe, mixer })
            break;

          case 32: // space
            this.isTakingComplexAction = false
            await this.doOnce({ idle, to: jump, mixer })
            break;

          case 82: // r
            setTimeout(async () => {
              this.isTakingComplexAction = true
              // this.viewCameraMode = 'firstperson'
              await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log(e))
              // this.viewCameraMode = 'firstperson'
              this.isTakingComplexAction = false
            })
            // await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log)

            break;

          case 84: // t
            setTimeout(async () => {
              this.isTakingComplexAction = true
              // this.viewCameraMode = 'firstperson'
              await this.doOnce({ idle, to: skillAction2, mixer }).catch(e => console.log(e))
              // this.viewCameraMode = 'firstperson'
              this.isTakingComplexAction = false
            })
            // await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log)

            break;

          case 81: // q
            await this.doStart({ idle, to: turnLeft, mixer, stopAll: false })
            break;
          case 69: // e
            await this.doStart({ idle, to: turnRight, mixer, stopAll: false })
            break;
        }
      }

      var onKeyUp = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            await this.doEnd({ idle: idle, to: running, mixer })
            break;

          case 37: // left
          case 65: // a
            await this.doEnd({ idle: idle, to: leftStrafe, mixer })
            break;

          case 40: // down
          case 83: // s
            await this.doEnd({ idle: idle, to: runningBack, mixer })
            break;

          case 39: // right
          case 68: // d
            await this.doEnd({ idle: idle, to: rightStrafe, mixer })
            break;

          case 81: // q
            await this.doEnd({ idle: idle, to: turnLeft, mixer })
            break;

          case 69: // e
            await this.doEnd({ idle: idle, to: turnRight, mixer })
            break;
        }
      }

      this.$on('go-forward', (v) => {
        if (v) {
          onKeyDown({ keyCode: 87 })
        } else {
          onKeyUp({ keyCode: 87 })
        }
      })

      this.$on('go-backward', (v) => {
        if (v) {
          onKeyDown({ keyCode: 83 })
        } else {
          onKeyUp({ keyCode: 83 })
        }
      })

      this.$on('go-left', (v) => {
        if (v) {
          onKeyDown({ keyCode: 65 })
        } else {
          onKeyUp({ keyCode: 65 })
        }
      })

      this.$on('go-right', (v) => {
        if (v) {
          onKeyDown({ keyCode: 68 })
        } else {
          onKeyUp({ keyCode: 68 })
        }
      })

      this.$on('turn-left', (v) => {
        if (v) {
          onKeyDown({ keyCode: 81 })
        } else {
          onKeyUp({ keyCode: 81 })
        }
      })

      this.$on('turn-right', (v) => {
        if (v) {
          onKeyDown({ keyCode: 69 })
        } else {
          onKeyUp({ keyCode: 69 })
        }
      })

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
    },
    setupGyroCam () {
      if (this.isMobile) {
        let proxyCam = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
        let DeviceOrientationControls = require('three/examples/jsm/controls/DeviceOrientationControls').DeviceOrientationControls
        let controls = new DeviceOrientationControls(proxyCam, this.lookup('element'))
        controls.dampping = true

        this.lookup('base').onLoop(() => {
          controls.enabled = true
          controls.update()
          // console.log(proxyCam.position.x, proxyCam.rotation.y)
          if (typeof proxyCam.rotation.y !== 'undefined') {
            this.useGyro = true
            this.controlTarget.rotation.y = proxyCam.rotation.y
          }
        })
      }
    },
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
    this.camera.position.z = -1000
    this.camera.position.y = 380

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // let controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   controls.update()
    // })

    await this.setupCameraSystem()

    // this.setupGyroCam()

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
    var renderScene = new RenderPass(this.scene, this.camera)
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

    document.addEventListener('keydown', (e) => {
      if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        return false
      }
    }, false)
  }
}
</script>

<style lang="postcss">
.moves-box{
  height: 170px;
}
@screen lg {
  .moves-box{
    height: calc(100% - 180px);
  }
}
</style>
