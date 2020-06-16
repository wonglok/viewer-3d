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

    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center" v-show="!charReady" :style="{ backgroundColor: !charReady ? `rgba(0,0,0,0.6)` : '' }" >
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white">
        <span>Loading... {{ loadProgress.toFixed(1) }}%</span>
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
import { Tree, PCamera, ShaderCubeChrome, getID } from '../Reusable'
import { Scene, Color, Clock, DefaultLoadingManager, Vector3, Raycaster, Object3D, AnimationMixer, LoopOnce } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
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
      controls: false,
      charmover: new Object3D(),
      controlTarget: new Object3D(),
      // face vs chase
      camMode: 'chase',
      // characterO3D: false,
      charReady: false,
      guyGLTF: false,
      activeMixers: [],
      displayStartMenu: true,

      loadingManager: false,
      loadProgress: 0,

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
      // blur: 0,
      // socket: false,
      // entered: false
    }
  },
  methods: {
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
    async doOnce ({ idle, to, mixer }) {
      return new Promise((resolve) => {
        if (to.isRunning()) {
          resolve()
          return
        }
        // mixer.stopAllAction()
        idle.reset()
        to.reset()

        let fade = 0.1

        to.enabled = true
        idle.enabled = true

        to.repetitions = 1
        to.clampWhenFinished = true
        to.reset().play()

        idle.crossFadeTo(to, fade * to.duration, false)

        clearTimeout(this.doOnceTimeout)
        this.doOnceTimeout = setTimeout(() => {
          idle.crossFadeFrom(to, fade * to.duration, false)
          idle.enabled = true
          idle.play()
        }, to.duration * 1000 * (1.0 - fade))
        setTimeout(() => {
          resolve()
        }, to.duration * 1000)
      })
    },
    async doStart ({ idle, to, mixer }) {
      return new Promise((resolve, reject) => {
        if (to.isRunning()) {
          resolve(false)
          return
        }
        idle.reset()
        to.reset()

        let fade = 0.3

        to.enabled = true
        idle.enabled = true

        to.repetitions = Infinity
        to.clampWhenFinished = true
        to.reset().play()

        idle.crossFadeTo(to, fade * to.duration, false)
        resolve(true)
      })
    },
    async doEnd ({ idle, to, mixer }) {
      return new Promise((resolve) => {
        let fade = 0.3
        idle.crossFadeFrom(to, fade * to.duration, false)
        idle.enabled = true
        idle.play()
      })
    },
    setWeight (action, weight) {
      action.enabled = true
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(weight)
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
      this.controlTarget.position.z = 980

      this.controlTarget.rotateY

      let camPlacer = new Object3D()
      let camPlacerVec3 = new Vector3()
      camPlacer.position.y = 130
      camPlacer.position.z = 200

      let charPlacer = new Object3D()
      let charPlacerVec3 = new Vector3()
      charPlacer.position.y = 0
      charPlacer.position.z = 0

      this.controlTarget.add(camPlacer)
      this.controlTarget.add(charPlacer)

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
            if ( canJump === true ) velocity.y += 0;
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

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
      // raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, 10 );

      // this.camera.position.z = 500

      let lookAtVec3 = new Vector3()

      this.lookup('base').onLoop(() => {
        var time = performance.now()
        var delta = (time - prevTime) / 1000
        prevTime = time;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y = 0
        // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if (turnLeft) {
          this.controlTarget.rotation.y += delta * 1.75
        }
        if (turnRight) {
          this.controlTarget.rotation.y -= delta * 1.75
        }
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

        // direction.z = Number(moveForward) - Number(moveBackward)
        // direction.x = Number(moveRight) - Number(moveLeft)
        // direction.normalize(); // this ensures consistent movements in all directions
        // if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        // if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
        // this.controlTarget.position.x += -velocity.x * delta * speedScale
        // this.controlTarget.position.z -= -velocity.z * delta * speedScale

        // this.controlTarget.position.y += ( velocity.y * delta);

        this.controlTarget.updateMatrix()
        this.controlTarget.updateMatrixWorld()
        this.controlTarget.updateWorldMatrix()

        camPlacerVec3.setFromMatrixPosition(camPlacer.matrixWorld)
        charPlacerVec3.setFromMatrixPosition(charPlacer.matrixWorld)

        this.charmover.rotation.x = this.controlTarget.rotation.x
        this.charmover.rotation.y = this.controlTarget.rotation.y
        this.charmover.rotation.z = this.controlTarget.rotation.z

        this.charmover.position.x = charPlacerVec3.x
        this.charmover.position.y = charPlacerVec3.y
        this.charmover.position.z = charPlacerVec3.z
        // this.charmover.rotation.y = Math.PI

        this.camera.position.x = camPlacerVec3.x
        this.camera.position.y = camPlacerVec3.y
        this.camera.position.z = camPlacerVec3.z

        if (this.guyFace && this.charReady) {
          lookAtVec3.setFromMatrixPosition(this.guyFace.matrixWorld)
          this.camera.lookAt(lookAtVec3)
        }

        // if (!parentScrollBox) { return }

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
    async setupAnimationSystem () {
      let moves = this.moves
      let mixer = await this.prepMixer({ actor: this.guyGLTF.scene })

      // let preload = async () => {
      //   let tasks = []
      //   tasks.push(this.loadMoveByName({ name }))
      //   await Promise.all(tasks)
      // }
      // await preload()

      let idle = await this.getActionByDisplayName({ name: 'Mma Idle', mixer })
      let taunt = await this.getActionByDisplayName({ name: 'Taunt (1)', mixer })
      let warmUp = await this.getActionByDisplayName({ name: 'Warming Up', mixer })

      let punch = await this.getActionByDisplayName({ name: 'knee jab to upper cut', mixer })

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

      await this.doOnce({ idle, to: taunt, mixer })
      this.charReady = true

      // this.$watch('displayStartMenu', () => {
      //   if (!this.entered && !this.displayStartMenu && this.charReady) {
      //     this.$emit('taunt')
      //   }
      // })
      // this.$watch('entered', async () => {
      //   if (this.entered && this.charReady) {
      //     await this.doOnce({ idle, to: warmUp, mixer })
      //   }
      // })

      let moveForward = false
      let moveLeft = false
      let moveRight = false
      let moveBackward = false
      var onKeyDown = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = true;
            await this.doStart({ idle, to: running, mixer })
            break;

          case 37: // left
          case 65: // a
            await this.doStart({ idle, to: leftStrafe, mixer })
            moveLeft = true;
            break;

          case 40: // down
          case 83: // s
            await this.doStart({ idle, to: runningBack, mixer })
            moveBackward = true;
            break;

          case 39: // right
          case 68: // d
            await this.doStart({ idle, to: rightStrafe, mixer })
            moveRight = true;
            break;

          case 32: // space
            await this.doOnce({ idle, to: jump, mixer })
            break;

          case 82: // r
            await this.doOnce({ idle, to: punch, mixer })
            break;

          case 81: // q
            await this.doStart({ idle, to: turnLeft, mixer })
            break;
          case 69: // e
            await this.doStart({ idle, to: turnRight, mixer })
            break;
        }

      };

      var onKeyUp = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            await this.doEnd({ idle, to: running, mixer })
            moveForward = false;
            break;

          case 37: // left
          case 65: // a
            await this.doEnd({ idle, to: leftStrafe, mixer })
            moveLeft = false;
            break;

          case 40: // down
          case 83: // s
            await this.doEnd({ idle, to: runningBack, mixer })
            moveBackward = false;
            break;

          case 39: // right
          case 68: // d
            await this.doEnd({ idle, to: rightStrafe, mixer })
            moveRight = false;
            break;

          case 81: // q
            await this.doEnd({ idle, to: turnLeft, mixer })
            break;


          case 69: // e
            await this.doEnd({ idle, to: turnRight, mixer })
            break;
        }
      };

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
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

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // let controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   controls.update()
    // })
    await this.setupCameraSystem()
  }
}
</script>

<style>

</style>
