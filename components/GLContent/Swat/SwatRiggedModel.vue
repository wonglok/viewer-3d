<template>
  <div>
    <slot></slot>
    <!--
    <div class="absolute bottom-0 right-0 pb-32 z-40" v-if="isDev">
      <div  class="text-xs">roughness0</div>
      <input class="block" type="range" v-model="settings.roughness0" min="0" max="3" step="0.0000001">
      <div  class="text-xs">metalness0</div>
      <input class="block" type="range" v-model="settings.metalness0" min="0" max="3" step="0.0000001">


      <div  class="text-xs">roughness1</div>
      <input class="block" type="range" v-model="settings.roughness1" min="0" max="3" step="0.0000001">
      <div  class="text-xs">metalness1</div>
      <input class="block" type="range" v-model="settings.metalness1" min="0" max="3" step="0.0000001">
    </div> -->
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, MeshMatcapMaterial, TextureLoader, DoubleSide, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera, FileLoader, MeshPhysicalMaterial } from 'three'
import copy2clip from 'copy-to-clipboard'

// WebGLCubeRenderTarget, CubeCamera, RGBFormat, LinearMipmapLinearFilter,

require('requestidlecallback')
let requstIdleCallback = window.requstIdleCallback || setTimeout
let idle = (t = 0) => new Promise((resolve) => { requstIdleCallback(resolve) })

let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
    character: {
      default: 'swat'
    },
    shaderCube: {
      default: false
    }
    // camera: {},
    // move: {}
  },
  data () {
    return {
      isDev: process.env.NODE_ENV === 'development',
      settings: {
        roughness0: 0,
        metalness0: 0,

        roughness1: 0,
        metalness1: 0
      },
      gltf: false
    }
  },
  components: {
    ...require('../../webgl')
  },
  beforeDestroy () {
    // if (this.gltf) {
    //   this.$emit('removeGLTF', this.gltf)
    // }
    this.cleanup()
  },
  methods: {
    async cleanup () {
      this.o3d.traverse(async (item) => {
        if (item && item.isMesh) {
          await idle()
          if (item.geometry && item.geometry) {
            item.geometry.dispose()
          }
          await idle()
          if (item.material && item.material) {
            item.material.dispose()
          }
        }
      })
      this.o3d.children.forEach(async (item) => {
        await idle()
        this.o3d.remove(item)
      })
    },
    copyText () {
      let ss = this.settings
      copy2clip(`
        roughness0: ${ss.roughness0},
        metalness0: ${ss.metalness0},

        roughness1: ${ss.roughness1},
        metalness1: ${ss.metalness1}
      `)
    },
    configModel ({ model }) {
      let settings = this.settings

      let configModelMat = () => {
        model.scene.traverse((item) => {
          if (item.isMesh && item.material) {
            item.frustumCulled = false
            item.material.transparent = true
            // item.material.envMap = this.cubeRenderTarget.texture
            if (this.character === 'swat') {
              console.log(item.name)
              let last = item.material
              item.material = new MeshPhysicalMaterial({ aoMapIntensity: 1, transparent: true, metalnessMap: last.metalnessMap, roughnessMap: last.roughnessMap, normalMap: last.normalMap, color: 0xffffff, map: last.map, skinning: true })

              if (this.shaderCube && item.name === 'Mesh_1') {
                item.material.envMap = this.shaderCube.out.envMap
              }
              if (this.shaderCube && item.name === 'Mesh_0') {
                item.material.envMap = this.shaderCube.out.envMap
              }
            }
            if (this.character === 'gasmask' && this.shaderCube) {
              item.material.envMap = this.shaderCube.out.envMap
            }
          }
        })
      }
      configModelMat()

      this.$emit('setupGLTF', model)

      /*
      mixamorigHips
      mixamorigSpine
      mixamorigSpine1
      mixamorigSpine2
      mixamorigNeck
      mixamorigHead
      mixamorigHeadTop_End

      mixamorigLeftShoulder
      mixamorigLeftArm
      mixamorigLeftForeArm
      mixamorigLeftHand
      mixamorigLeftHandThumb1
      mixamorigLeftHandThumb2
      mixamorigLeftHandThumb3
      mixamorigLeftHandThumb4
      mixamorigLeftHandIndex1
      mixamorigLeftHandIndex2
      mixamorigLeftHandIndex3
      mixamorigLeftHandIndex4
      mixamorigLeftHandMiddle1
      mixamorigLeftHandMiddle2
      mixamorigLeftHandMiddle3
      mixamorigLeftHandMiddle4
      mixamorigLeftHandRing1
      mixamorigLeftHandRing2
      mixamorigLeftHandRing3
      mixamorigLeftHandRing4
      mixamorigLeftHandPinky1
      mixamorigLeftHandPinky2
      mixamorigLeftHandPinky3
      mixamorigLeftHandPinky4
      mixamorigRightShoulder
      mixamorigRightArm
      mixamorigRightForeArm
      mixamorigRightHand
      mixamorigRightHandThumb1
      mixamorigRightHandThumb2
      mixamorigRightHandThumb3
      mixamorigRightHandThumb4
      mixamorigRightHandIndex1
      mixamorigRightHandIndex2
      mixamorigRightHandIndex3
      mixamorigRightHandIndex4
      mixamorigRightHandMiddle1
      mixamorigRightHandMiddle2
      mixamorigRightHandMiddle3
      mixamorigRightHandMiddle4
      mixamorigRightHandRing1
      mixamorigRightHandRing2
      mixamorigRightHandRing3
      mixamorigRightHandRing4
      mixamorigRightHandPinky1
      mixamorigRightHandPinky2
      mixamorigRightHandPinky3
      mixamorigRightHandPinky4
      mixamorigLeftUpLeg
      mixamorigLeftLeg
      mixamorigLeftFoot
      mixamorigLeftToeBase
      mixamorigLeftToe_End
      mixamorigRightUpLeg
      mixamorigRightLeg
      mixamorigRightFoot
      mixamorigRightToeBase
      mixamorigRightToe_End
      Ch15
      Mesh_0
      Mesh_1
      */

      // this.o3d.rotation.z = Math.PI * 0.5
      // this.o3d.rotation.x = Math.PI * -0.5

      // this.o3d.rotation.z += Math.PI * 0.5

      this.$emit('guySkeleton', this.o3d)
      model.scene.traverse(async (item) => {
        if (item && item.name === 'mixamorigSpine2') {
          let guyCenter = new Object3D()
          guyCenter.position.y = 0
          item.add(guyCenter)
          this.$emit('guy', guyCenter)
          await idle()
        }

        if (item && item.name === 'mixamorigSpine') {
          let guyBack = new Object3D()
          guyBack.position.y = 0
          guyBack.position.z = 0
          item.add(guyBack)
          this.$emit('guyBack', guyBack)
          await idle()
        }

        if (item && item.name === 'mixamorigNeck') {
          let guyNeck = new Object3D()
          guyNeck.position.y = 0
          guyNeck.position.z = 0
          item.add(guyNeck)
          this.$emit('guyNeck', guyNeck)
          await idle()
        }

        if (item && item.name === 'mixamorigHead') {
          let guyFace = new Object3D()
          guyFace.position.x = 0
          guyFace.position.y = 0
          guyFace.position.z = 0
          item.add(guyFace)
          this.$emit('guyFace', guyFace)
          await idle()
        }

        if (item && item.name === 'mixamorigHead') {
          let guyHeadCam = new Object3D()
          guyHeadCam.position.x = 0
          guyHeadCam.position.y = 0
          guyHeadCam.position.z = -100
          item.add(guyHeadCam)
          this.$emit('guyHeadCam', guyHeadCam)
          await idle()
        }

        if (item && item.name === 'mixamorigHead') {
          let guyHead = new Object3D()
          guyHead.position.y = 0
          guyHead.position.z = 0
          item.add(guyHead)
          this.$emit('guyHead', guyHead)
          await idle()
        }

        if (item && item.name === 'mixamorigHips') {
          let guyHip = new Object3D()
          guyHip.position.y = 0
          guyHip.position.z = 0
          item.add(guyHip)
          this.$emit('guyHip', guyHip)
          await idle()
        }

        // console.log(item.name)
      })

      idle().then(() => {
        this.cleanup()
        this.o3d.add(model.scene)
      })

      // this.o3d.add(model.scene)
    },
    async loadStuff () {
      let shaderCube = this.shaderCube || new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop })

      // let loaderFBX = new FBXLoader(this.lookup('loadingManager'))

      let loadArrayBuffer = async (url) => {
        return new Promise((resolve) => {
          let loaderFile = new FileLoader(this.lookup('loadingManager'))
          loaderFile.setResponseType('arraybuffer')
          loaderFile.load(url, (arrbuff) => {
            resolve(arrbuff)
          }, (v) => {
            let manager = this.lookup('loadingManager')
            if (manager.onURL) {
              manager.onURL(url, v.loaded / v.total)
            }
          })
        })
      }

      let localforage = require('localforage')
      var store = localforage.createInstance({
        name: 'rigged-model-dancefloor'
      });
      let provideArrayBuffer = async (url) => {
        let NS = 'array-buffer-@' + url
        try {
          var value = await store.getItem(NS);
          if (!value) {
            let arrayBuffer = await loadArrayBuffer(url)
            value = arrayBuffer
            await store.setItem(NS, arrayBuffer)
          }
          console.log(value)
          return value
        } catch (err) {
          console.log(err);
          await store.removeItem(NS);
        }
      }

      let modelParser = (arrBuff) => {
        return new Promise((resolve) => {
          let loaderModel = new GLTFLoader(this.lookup('loadingManager'))
          loaderModel.parse(arrBuff, '/', (parsed) => {
            console.log(parsed)
            resolve(parsed)
          })
        })
      }

      let loadChar = async () => {
        let all = await Promise.all([
          new Promise(async (resolve) => {
            let url = require('file-loader!./character/swat-guy.glb')

            if (this.character === 'girl') {
              url = require('file-loader!./character/girl.glb')
            }
            if (this.character === 'swat') {
              url = require('file-loader!./character/swat-guy.glb')
            }
            if (this.character === 'gasmask') {
              url = require('file-loader!./character/gasmask.glb')
            }
            let arrayBuffer = await provideArrayBuffer(url)
            await idle()
            let gltfobj = await modelParser(arrayBuffer)
            await idle()
            resolve(gltfobj)
          })
        ])

        this.configModel({
          model: all[0]
        })
      }

      loadChar()
      this.$watch('character', async () => {
        loadChar()
      })

      // var cubeRenderTarget = this.cubeRenderTarget = new WebGLCubeRenderTarget( 128, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter } );
      // // Create cube camera
      // var cubeCamera = new CubeCamera(1, 100000, cubeRenderTarget);
      // let renderer = this.lookup('renderer')
      // let scene = this.lookup('scene')
      // scene.add(cubeCamera);
      // this.lookup('base').onLoop(() => {
      //   this.o3d.visible = false
      //   cubeCamera.position.copy(this.o3d.position)
      //   cubeCamera.update(renderer, scene)
      //   this.o3d.visible = true
      // })
    }
  },
  mounted () {
    this.loadStuff()
  }
}
</script>

<style>

</style>
