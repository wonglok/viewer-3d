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

      <O3D :animated="true" layout="overallChar" :visible="!!charReady">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correctAxis">
            <SwatRiggedModel @removeGLTF="removeGLTF({ gltf: $event })" @setupGLTF="setupGLTF({ gltf: $event })" @guy="guy = $event;" @guyHead="guyHead = $event; setupHeadCam()" @guyBack="guyBack = $event" @guyFace="guyFace = $event" @guySkeleton="guySkeleton = $event" :shaderCube="shaderCube"></SwatRiggedModel>
          </O3D>
        </O3D>
      </O3D>
    </O3D>

    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center" ref="toucher" :style="{ backgroundColor: displayStartMenu ? `rgba(0,0,0,0.6)` : '' }" >
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white cursor-pointer" v-show="displayStartMenu" @click="setupControls()" ref="startmenu">
        <span v-if="!!charReady">
          <span v-if="!entered">Start Game</span>
          <span v-if="entered">Resume Game</span>
        </span>
        <span v-if="!charReady">
          <span>Loading... {{ loadProgress.toFixed(1) }}%</span>
        </span>
      </div>
    </div>
    <div class="absolute top-0 left-0 p-3" v-if="!displayStartMenu">
      <div class="block px-2 mx-1 my-1 border-gray-100 border bg-gray-800 text-20 text-white cursor-pointer">ESC to Close</div>
    </div>
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
  name: 'GospelScene',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
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
      blur: 0,
      socket: false,
      entered: false
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
      await this.setupMovesDB()
      await this.setupAnimationSystem()
    },
    setupHeadCam () {
      // let headPosition = new Vector3()

      // if (this.guyHead) {
      //   headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
      //   headPosition.y += 10
      // }
      // this.camera.position.y = headPosition.y
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
      let controlMapper = require('../GLContent/Swat/controls/fbx').default
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
      addToArr(idleMapper)
      addToArr(controlMapper)

      addToArr(kickMapper)
      addToArr(boxingMapper)
      addToArr(superheroMapper)
      addToArr(boxinghitMapper)
      addToArr(locomotionMapper)
      addToArr(gestureMapper)
      addToArr(thrillerMapper)
      addToArr(breakdancesMapper)
      addToArr(danceingMapper)

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
            console.log(clip)
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
    async getActionByDisplayName ({ inPlace, name, mixer }) {
      let moveObj = await this.loadMove(this.moves.find(e => e.displayName === name))
      let actionObj = await this.prepAnimation({ inPlace, pose: moveObj.actionFBX, mixer })
      return actionObj
    },
    async doOnce ({ idle, to, mixer }) {
      return new Promise((resolve) => {
        if (to.isRunning()) {
          resolve()
          return
        }

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
      return new Promise((resolve) => {
        if (to.isRunning()) {
          resolve()
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
        resolve()
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
    async setupAnimationSystem () {
      let moves = this.moves
      let mixer = await this.prepMixer({ actor: this.guyGLTF.scene })
      let idle = await this.getActionByDisplayName({ name: 'Mma Idle', mixer })
      let jump = await this.getActionByDisplayName({ name: 'jump', mixer })
      let walking = await this.getActionByDisplayName({ name: 'general walking', mixer })

      let goForward = await this.getActionByDisplayName({ inPlace: true, name: 'control go forward', mixer })
      let goBackward = await this.getActionByDisplayName({ inPlace: true, name: 'control go backward', mixer })
      let goLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control go left', mixer })
      let goRight = await this.getActionByDisplayName({ inPlace: true, name: 'control go right', mixer })

      idle.play()
      this.charReady = true

      let moveForward = false
      let moveLeft = false
      let moveRight = false
      let moveBackward = false
      var onKeyDown = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = true;
            await this.doStart({ idle, to: goForward, mixer })
            break;

          case 37: // left
          case 65: // a
            await this.doStart({ idle, to: goLeft, mixer })
            moveLeft = true;
            break;

          case 40: // down
          case 83: // s
            await this.doStart({ idle, to: goBackward, mixer })
            moveBackward = true;
            break;

          case 39: // right
          case 68: // d
            await this.doStart({ idle, to: goRight, mixer })
            moveRight = true;
            break;

          case 32: // space
            await this.doOnce({ idle, to: jump, mixer })
            break;
        }

      };

      var onKeyUp = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            await this.doEnd({ idle, to: goForward, mixer })
            moveForward = false;
            break;

          case 37: // left
          case 65: // a
            await this.doEnd({ idle, to: goLeft, mixer })
            moveLeft = false;
            break;

          case 40: // down
          case 83: // s
            await this.doEnd({ idle, to: goBackward, mixer })
            moveBackward = false;
            break;

          case 39: // right
          case 68: // d
            await this.doEnd({ idle, to: goRight, mixer })
            moveRight = false;
            break;
        }
      };

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );

    },
    setupDesktopControls () {
      let PointerLockControls = require('three/examples/jsm/controls/PointerLockControls.js').PointerLockControls
      let controls = new PointerLockControls(this.camera, this.lookup('element'))
      controls.lock()
      controls.addEventListener('lock', () => {
        this.displayStartMenu = false
      })
      controls.addEventListener('unlock', () => {
        this.displayStartMenu = true
      })
      var objects = []

			var raycaster

			var moveForward = false
			var moveBackward = false
			var moveLeft = false
			var moveRight = false
			var canJump = false

			var prevTime = performance.now()
			var velocity = new Vector3()
			var direction = new Vector3()
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
        }
      };

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
      raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, 10 );

      // let camPlaceholder = new Object3D()
      // let headPosition = new Vector3()
      // let backPosition = new Vector3()
      // let centerPosition = new Vector3()
      // let syncPos = () => {
      //   if (this.guy) {
      //     this.guy.getWorldPosition(centerPosition)
      //   }
      //   if (this.guyBack) {
      //     this.guyBack.position.z = -50
      //     this.guyBack.position.y = -30
      //     backPosition.setFromMatrixPosition(this.guyBack.matrixWorld)
      //   }
      //   if (this.guyHead) {
      //     headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
      //     headPosition.y -= 50
      //   }
      // }
      // syncPos()
      // this.camera.lookAt(headPosition)

      this.camera.position.y = 200
      this.camera.lookAt(this.guySkeleton.position)
      this.lookup('base').onLoop(() => {
        // syncPos()

        if ( controls.isLocked === true ) {

          raycaster.ray.origin.copy( controls.getObject().position );
					raycaster.ray.origin.y -= 10;

					var intersections = raycaster.intersectObjects( objects );

					var onObject = intersections.length > 0;

					var time = performance.now();
					var delta = ( time - prevTime ) / 1000;

					velocity.x -= velocity.x * 10.0 * delta;
					velocity.z -= velocity.z * 10.0 * delta;

					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

					direction.z = Number(moveForward) - Number(moveBackward);
					direction.x = Number(moveRight) - Number(moveLeft);
					direction.normalize(); // this ensures consistent movements in all directions

					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

					if ( onObject === true ) {
						velocity.y = Math.max(0, velocity.y);
						canJump = true;
          }
          let speedScale = 1.0
          controls.moveRight( - velocity.x * delta * speedScale );
          controls.moveForward( - velocity.z * delta * speedScale );
					controls.getObject().position.y += ( velocity.y * delta ); // new behavior

          // left right
          this.guySkeleton.position.x = -controls.getObject().position.x / 180
          // front back
          this.guySkeleton.position.y = (controls.getObject().position.z - 200) / 180

          if ( controls.getObject().position.y < 80 ) {
            velocity.y = 0;
            controls.getObject().position.y = 80;
            canJump = true;
          }

          // this.guySkeleton.position.y = controls.getObject().position.y / 180
          // this.camera.position.y = controls.getObject().position.y
					prevTime = time;

        }

        // this.camera.lookAt(this.ca)
      })
      this.entered = true
    },
    setupControls () {
      if (window.innerWidth > 500) {
        this.setupDesktopControls()
      } else {
        this.setupMobileControls()
      }
    },
    setupMobileControls () {

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

    // controls.addEventListener( 'lock', function () {
    //   menu.style.display = 'none';
    // } );

    // controls.addEventListener( 'unlock', function () {
    //   menu.style.display = 'block';
    // } );

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

        overallChar: {
          sx: 1,
          sy: 1,
          sz: 1,
          ry: Math.PI
        },
        correctAxis: !this.moves ? {
          // rx: Math.PI * -0.5,
          // ry: Math.PI * -1.5,
          // rz: Math.PI * 0.5
        } : {
          // rx: Math.PI * -0.5,
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

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // let controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.lookup('base').onLoop(() => {
    //   controls.update()
    // })





  }
}
</script>

<style>

</style>
