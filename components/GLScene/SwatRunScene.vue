<template>
  <O3D v-if="layouts && shaderCube">
    <AmbinetLight :intensity="2"></AmbinetLight>
    <DirectionalLight :intensity="1"></DirectionalLight>
    <HemisphereLight :intensity="1"></HemisphereLight>

    <O3D :animated="true" layout="walk">
      <SwatWalk></SwatWalk>
    </O3D>

    <!-- <LightArea></LightArea> -->
    <O3D :animated="true" layout="bg">
      <ChromaticsBG></ChromaticsBG>
    </O3D>

    <O3D :animated="true" layout="charMover" @o3d="charchar = $event" :visible="charReady">

      <O3D :animated="true" layout="calibration">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correctAxis">
            <SwatRiggedModel :character="'swat'" @removeGLTF="removeGLTF({ gltf: $event })" @setupGLTF="setupGLTF({ gltf: $event })" @guy="guy = $event;" @guyHead="guyHead = $event;" @guyBack="guyBack = $event" @guyFace="guyFace = $event" @guyHip="guyHip = $event" @guySkeleton="guySkeleton = $event" :shaderCube="shaderCube"></SwatRiggedModel>
          </O3D>
        </O3D>
      </O3D>

      <!-- <O3D :animated="true" layout="center"> -->
        <!-- <SwatRun :scene="scene" :shaderCube="shaderCube" @loaded="$emit('gorun')"></SwatRun> -->
      <!-- </O3D> -->
      <!-- <O3D :animated="true" layout="mouse">
        <SwatIdle :shaderCube="shaderCube" @loaded="$emit('gorun')"></SwatIdle>
      </O3D> -->
    </O3D>

    <!--  -->

<!--
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
import { Tree, RayPlay, PCamera, ShaderCubeChrome, makeScroller, getID } from '../Reusable'
import { Scene, Color, Vector3, LoadingManager, DefaultLoadingManager, AnimationMixer, Clock, Object3D, Euler } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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

      loadingManager: false,
      activeLog: [],
      loaderAPI: false,
      shaderCube: false,
      ready: false,
      settings: {},
      flower1: {},

      charReady: false,

      initConfig: {
        scale: 0.1,
      },
      // guy
      guy: false,
      guyHead: false,
      guyBack: false,
      guyFace: false,
      guySkeleton: false,
      charMover: new Object3D(),
      charchar: false,

      scene: new Scene(),
      layouts: false,
      blur: 0,
      socket: false
    }
  },
  methods: {
    removeGLTF ({ gltf }) {},
    setupGLTF ({ gltf }) {},
    onReady () {
      // this.ready = true
      // setTimeout(() => {
      //   this.scene.background = new Color('#fafafa')
      // }, 1000)
    },
    async setupGLTF ({ gltf }) {
      await this.setupChar({ gltf })
    },
    async setupChar ({ gltf }) {
      this.charReady = false
      await this.setupAnimationSystem({ gltf })
      if (this.lastClickedMove) {
        this.$emit('play-move', { move: this.lastClickedMove })
      }
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
      if (this.moves) {
        return
      }
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

      let addToList = async ({ mapper, type, preload }) => {
        let arr = []
        for (let kn in mapper) {
          arr.push({
            type,
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

      addToList({ mapper: prayerMapper, type: 'ready' })
      addToList({ mapper: idleMapper, type: 'ready' })
      addToList({ mapper: gestureMapper, type: 'ready' })

      addToList({ mapper: thrillerMapper, type: 'dance' })
      addToList({ mapper: breakdancesMapper, type: 'dance' })
      addToList({ mapper: danceingMapper, type: 'dance' })

      addToList({ mapper: superheroMapper, type: 'action' })

      addToList({ mapper: kneeMapper, type: 'combat' })
      addToList({ mapper: kickMapper, type: 'combat' })
      addToList({ mapper: boxingMapper, type: 'combat' })
      addToList({ mapper: mmaMapper, type: 'combat' })
      addToList({ mapper: boxinghitMapper, type: 'combat' })
      addToList({ mapper: hurtMapper, type: 'combat' })

      addToList({ mapper: locomotionMapper, type: 'control' })
      addToList({ mapper: rifleMapper, type: 'control' })
      addToList({ mapper: controlMapper, type: 'control' })
      addToList({ mapper: capoeiraMapper, type: 'dance' })

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
          this.viewSettings.adjustX = ${1 / this.initConfig.scale * this.viewSettings.adjustX}
          this.viewSettings.adjustY = ${1 / this.initConfig.scale * this.viewSettings.adjustY}
          this.viewSettings.adjustZ = ${1 / this.initConfig.scale * this.viewSettings.adjustZ}

          this.viewSettings.cameraExtraHeight = ${1 / this.initConfig.scale * this.viewSettings.cameraExtraHeight}
          this.viewSettings.farest = ${1 / this.initConfig.scale * this.viewSettings.farest}
          this.viewSettings.defaultCloseup = ${1 / this.initConfig.scale * this.viewSettings.defaultCloseup}
      `)
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
    async setupAnimationSystem ({ gltf }) {
      let moves = this.moves
      let mixer = await this.prepMixer({ actor: gltf.scene })

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
      // let skillAction2 = await this.getActionByDisplayName({ name: 'Speedbag', mixer })

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
        try {
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

          this.isTakingComplexAction = true
          let action = await this.getActionByDisplayName({ name: move.displayName, mixer })
          await this.doMany({ idle, to: action, mixer, stopAll: true }).catch(() => {
            this.isTakingComplexAction = false
          })
          this.isTakingComplexAction = false
        } catch (e) {
          console.log(e)
        }
      })

      // this.viewCameraMode = 'face'
      this.$emit('play-move', { move: { displayName: 'Warming Up' }, cb: () => {} })

      // setTimeout(async () => {
      //   this.viewCameraMode = 'close'
      //   await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log(e))
      //   this.viewCameraMode = 'firstperson'
      // })

      setTimeout(() => {
        this.charReady = true
      }, 100)

      let moveForward, moveLeft, moveRight, moveBackward = false
      var onKeyDown = async (event) => {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveForward = true
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: running, mixer })
            break;

          case 37: // left
          case 65: // a
            moveLeft = true
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: leftStrafe, mixer })
            break;

          case 40: // down
          case 83: // s
            moveBackward = true
            this.isTakingComplexAction = false
            await this.doStart({ canRestore: true, idle, to: runningBack, mixer })
            break;

          case 39: // right
          case 68: // d
            moveRight = true
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
            moveForward = false
            await this.doEnd({ idle: idle, to: running, mixer })
            break;

          case 37: // left
          case 65: // a
            moveLeft = false
            await this.doEnd({ idle: idle, to: leftStrafe, mixer })
            break;

          case 40: // down
          case 83: // s
            moveBackward = false
            await this.doEnd({ idle: idle, to: runningBack, mixer })
            break;

          case 39: // right
          case 68: // d
            moveRight = false
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

      let prevTime = 0
      this.lookup('base').onLoop(() => {
        if (!this.charReady) { return }
        var time = performance.now()
        var delta = (time - prevTime) / 1000
        prevTime = time;

        if (this.charMover) {
          if (turnLeft) {
            this.charMover.rotation.y += delta * 1.75
          }
          if (turnRight) {
            this.charMover.rotation.y -= delta * 1.75
          }
          if (!this.isTakingComplexAction) {
            if (moveForward) {
              this.charMover.translateZ(-delta * 700 * 0.3)
            }
            if (moveBackward) {
              this.charMover.translateZ(delta * 700 * 0.3)
            }
            if (moveLeft) {
              this.charMover.translateX(-delta * 700 * 0.3)
            }
            if (moveRight) {
              this.charMover.translateX(delta * 700 * 0.3)
            }
          }
        }
      })

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
    }
  },
  async mounted () {
    await this.lookupWait('ready')

    // prepare camera
    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    // this.camera.position.x = -200
    // this.camera.position.y = 100
    this.camera.position.y = 40
    this.camera.position.z = 100
    this.scene.add(this.camera)

    /* BLOOM START */
    let { Vector2 } = require('three/src/math/Vector2')
    let { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer')
    let { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass')
    let { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass')
    var Params = {
      exposure: 1,
      bloomStrength: 1.5,
      bloomThreshold: 0.98,
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

    this.scene.background = new Color('#000000')
    this.shaderCube = new ShaderCubeChrome({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 64 })
    // this.scene.background = this.shaderCube.out.envMap

    // this.camera.lookAt(this.scene.position)
    // this.rayplay = new RayPlay({ mounter: this.lookup('element'), base: this.lookup('base'), camera: this.camera })

    let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    this.controls = new OrbitControls(this.camera, this.lookup('element'))
    this.controls.enablePan = true
    this.controls.enableDamping = true
    this.controls.enableKeys = false
    let charPlaceLast = new Vector3()
    let charPlace = new Vector3()
    let camPlace = new Vector3()

    this.lookup('base').onLoop(() => {
      if (this.guyBack) {
        this.controls.update()

        this.guyBack.updateMatrix()
        this.guyBack.updateMatrixWorld()
        this.guyBack.updateWorldMatrix()
        charPlace.setFromMatrixPosition(this.guyBack.matrixWorld)

        let diff = charPlaceLast.clone().sub(charPlace).multiplyScalar(-1)

        this.controls.object.position.add(diff)

        charPlaceLast.copy(charPlace)

        this.controls.target0.copy(charPlace)
        this.controls.target.copy(charPlace)
      }
    })

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.lookup('element'), limit: { direction: 'vertical', canRun: true, y: 2 }, onMove: () => {} })

    this.lookup('base').onLoop(() => {
      TWEEN.update()
    })

    await this.setupMovesDB()

    // let parentScrollBox = this.lookup('scrollBox')

    let looper = () => {
      let progress = vscroll.value

      // console.log(progress)
      // if (!parentScrollBox) { return }
      // this.camera.position.y = 350 * progress
      // this.camera.

      // if (this.$refs.swatrun) {
      //   this.camera.position.copy(this.$refs.swatrun.o3d.position)
      //   this.camera.position.z += 2000
      //   // this.camera.position.y += 250
      //   this.camera.lookAt(this.$refs.swatrun.o3d.position)
      // }

      this.layouts = {
        walk: {
          sx: 5.5 * 0.1,
          sy: 5.5 * 0.1,
          sz: 5.5 * 0.1,
          pz: 800 * 5.5 * 0.1,
          py: 900 * 0.1
        },
        bg: {
          pz: -390
        },
        charMover: {
          px: this.charMover.position.x,
          py: this.charMover.position.y,
          pz: this.charMover.position.z,

          rx: this.charMover.rotation.x,
          ry: this.charMover.rotation.y,
          rz: this.charMover.rotation.z
        },
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
          sx: 40,
          sy: 40,
          sz: 40,

          py: -40,
          // pz: 100
        }
      }
    }

    this.lookup('base').onLoop(looper)
  }
}
</script>

<style>

</style>
