<template>
  <O3D>
    <O3D  v-if="layouts && shaderCube && loaderAPI">
      <LightArea></LightArea>
      <DirectionalLight :amount="4"></DirectionalLight>
      <!-- <O3D v-if="isReady">
        <ChromaticsBG></ChromaticsBG>
      </O3D> -->

      <O3D :animated="true" layout="run" ref="swatrun">
        <O3D :animated="true" layout="center">
          <O3D :animated="true" layout="correct">
            <SwatDance :move="move" :scene="scene" :shaderCube="shaderCube"></SwatDance>
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
        </O3D> -->
      </O3D>
    </O3D>

    <div class="absolute z-10 top-0 left-0 text-white w-full h-full" ref="domlayer">
    </div>
    <div class="absolute z-20 top-0 left-0 text-white py-1">
      <a v-for="moveItem in moves" :key="moveItem._id + moveItem.displayName" @click.prevent="chooseMove(moveItem)" class="px-2 mx-1 border-gray-100 border">{{ moveItem.displayName }}</a>
    </div>

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
import { Tree, RayPlay, PCamera, ShaderCubeChrome, makeScroller } from '../Reusable'
import { Scene, Color, Vector3, LoadingManager } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

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
      move: false,
      moves: false,
      actionList,
      action,
      isReady: false,
      canMount: false,
      loadingManager:false,
      loaderAPI: false,
      shaderCube: false,
      ready: false,
      settings: {},
      flower1: {},

      scene: new Scene(),
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
    },
    chooseMove (move) {
      this.move = move
    }
  },
  created () {
    document.body.style.opacity = 0
  },
  async mounted () {
    let contrs = { opacity: 0 }
    const tween = new TWEEN.Tween(contrs) // Create a new tween that modifies 'coords'.
      .to({ opacity: 1 }, 1000) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => {
        // totalStat = dat.dynamic
        document.body.style.opacity = contrs.opacity
      })
      .start()
    this.lookup('base').onLoop(() => {
      TWEEN.update()
    })
    await this.lookupWait('ready')

    // prepare camera
    this.camera = new PCamera({ base: this.lookup('base'), element: this.lookup('element') })
    // this.camera.position.x = -200
    // this.camera.position.y = 100
    this.camera.position.z = 2500
    // this.camera.position.y = 500
    this.camera.lookAt(this.scene.position)


    /* Loader START */
    let makeGLProgress = async () => {
      let totalStat = 0
      let { Mesh } = require('three/src/objects/Mesh')
      let { PlaneBufferGeometry } = require('three/src/geometries/PlaneGeometry')
      let { MeshBasicMaterial } = require('three/src/materials/MeshBasicMaterial')
      let { getScreen, Damper } = require('../Reusable')
      let dampping = new Damper(0, this.lookup('base'), 0.5)
      dampping.value = 0
      let screen = getScreen({ camera: this.camera, depth: 500 })
      let screenScaler = 2
      let geo = new PlaneBufferGeometry(screen.width * screenScaler, 3, 2, 2)
      geo.translate(-screen.width * screenScaler, 0, 0)
      let mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true })
      let bar = new Mesh(geo, mat)
      this.scene.add(bar)
      this.cleanLoader = () => {
        this.scene.remove(bar)
      }
      this.lookup('base').onLoop(() => {
        dampping.value = totalStat
        bar.position.x = dampping.value * screen.width * screenScaler
      })
      return {
        reset () {
          totalStat = 0
          dampping.value = 0
          bar.visible = true
        },
        get loaded () {
          return dampping.value >= 0.999
        },
        updateProgress: (v) => {
          totalStat = 0.95 * v
          if (v >= 0.95) {
            let dat = { dynamic: totalStat }
            const tween = new TWEEN.Tween(dat) // Create a new tween that modifies 'coords'.
              .to({ dynamic: 1 }, 1000) // Move to (300, 200) in 1 second.
              .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
              .onUpdate(() => {
                totalStat = dat.dynamic
              })
              .onComplete(() => {
                this.canMount = true
                setTimeout(() => {
                  bar.visible = false
                  this.isReady = true
                }, 150)
              })
              .delay(0)
              .start()
          }
        }
      }
    }
    this.loaderAPI = await makeGLProgress()
    this.loadingManager = new LoadingManager()
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      // console.log(itemsLoaded / itemsTotal)
      this.loaderAPI.updateProgress(itemsLoaded / itemsTotal)
    }
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      // console.log(itemsLoaded / itemsTotal)
      this.loaderAPI.updateProgress(0.5)
    }
    /* Loader End */

    /* dance moves */
    let loaderFBX = new FBXLoader(this.loadingManager)
    let breakdancesMapper = require('../GLContent/Swat/breakdance/fbx').default
    let breakdances = []
    let i = 0
    for (let kn in breakdancesMapper) {
      breakdances.push({
        _id: i,
        displayName: kn,
        fbx: false,
        url: breakdancesMapper[kn]
      })
      i++
    }

    let tasks = breakdances.map((item) => {
      return new Promise((resolve) => {
        // eslint-disable-next-line
        loaderFBX.load(item.url, (v) => {
          item.fbx = v
          // console.log(v)
          resolve(item)
        }, (v) => {
          // console.log(v)
          // this.loaderAPI.updateProgress(v.loaded / v.total)
        }, () => {
          resolve(item)
        })
      }, console.log)
    })

    this.moves = await Promise.all(tasks)
    this.$nextTick(() => {
      this.move = this.moves[0]
    })
    /* dance moves end */

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

    this.scene.background = new Color('#000000')
    this.shaderCube = new ShaderCubeChrome({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, res: 64 })
    // this.scene.background = this.shaderCube.out.envMap

    // this.camera.lookAt(this.scene.position)
    // this.rayplay = new RayPlay({ mounter: this.lookup('element'), base: this.lookup('base'), camera: this.camera })

    // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    // this.controls = new OrbitControls(this.camera, this.lookup('element'))
    // this.controls.dampping = true
    // this.lookup('base').onLoop(() => {
    //   this.controls.update()
    // })

    // let i = 0
    // this.lookup('element').addEventListener('click', () => {
    //   this.loaderAPI.reset()
    //   this.action = this.actionList[(i % this.actionList.length)]
    //   i++
    // })

    this.scene.add(this.o3d)

    this.$parent.$emit('scene', this.scene)
    this.$parent.$emit('camera', this.camera)

    let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, y: 2 }, onMove: () => {} })

    // const tween = new TWEEN.Tween(vscroll) // Create a new tween that modifies 'coords'.
    //   .to({ value: 1 }, 3000) // Move to (300, 200) in 1 second.
    //   .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    //   .onUpdate(() => {
    //     // Called after tween.js updates 'coords'.
    //     // Move 'box' to the position described by 'coords' with a CSS translation.
    //   })
    // this.$on('gorun', () => {
    //   tween.start()
    // })

    // let parentScrollBox = this.lookup('scrollBox')

    let looper = () => {
      let progress = vscroll.value

      console.log()
      // if (Math.floor((progress / 2 * 3)).toFixed(0) % 3 === 0) {
      //   this.action = 'upper-jab'
      // } else if (Math.floor((progress / 2 * 3)).toFixed(0) % 3 === 1) {
      //   this.action = 'side-kick'
      // } else if (Math.floor((progress / 2 * 3)).toFixed(0) % 3 === 2) {
      //   this.action = 'mma-kick'
      // }

      // console.log(progress)
      // if (!parentScrollBox) { return }
      // this.camera.position.y = 350 * progress
      // this.camera.
      if (this.$refs.swatrun) {
        // this.camera.position.copy(this.$refs.swatrun.o3d.position)
        // this.camera.position.z += 2000
        // this.camera.position.y += 0
        // this.camera.position.y += 250
        // this.camera.lookAt(this.$refs.swatrun.o3d.position)
      }

      this.layouts = {
        // lensarea: {
        //   pz: 390
        // },
        run: {

          sx: 8,
          sy: 8,
          sz: 8,
          // pz: -100,
          // rx: Math.PI * 0.05 + Math.PI

          // pz: -250,
          // px: -2250,
          // ry: Math.PI * 0.15,
        },
        correct: {
          rz: Math.PI * 0.5,
          rx: Math.PI * -0.5
        },
        center: {
          ry: Math.PI * (progress),
          sx: 150,
          sy: 150,
          sz: 150,

          py: -150,
          // px: -200,
          // pz: 100
        },
        left: {
          // ry: Math.PI * 2 * (progress),
          px: 100,
          sx: 150,
          sy: 150,
          sz: 150,
          py: -150,
          // pz: (1 - parentScrollBox.page) * -2000
          // pz: (1.0 - parentScrollBox.page) * 2500
        },
        right: {
          // ry: Math.PI * 2 * (progress),
          px: -100,
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
