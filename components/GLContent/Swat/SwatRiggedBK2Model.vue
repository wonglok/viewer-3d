<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, MeshMatcapMaterial, TextureLoader, DoubleSide, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera, FileLoader } from 'three'

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
    },
    // camera: {},
    // move: {}
  },
  data () {
    return {
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
    this.o3d.children.forEach((kid) => {
      this.o3d.remove(kid)
    })
  },
  methods: {
    configModel ({ model }) {
      this.$on('configModelMat', () => {
        model.scene.traverse((item) => {
          if (item.isMesh && item.material) {
            item.frustumCulled = false
            item.material.transparent = true
          }
          if (this.shaderCube && this.character === 'swat') {
            if (item.isMesh && item.material) {
              item.material.envMap = this.shaderCube.out.envMap
              // item.material.roughness = 0.5
              // item.material.metalness = 0.5
            }

            if (item.isMesh && item.name === 'Mesh_1') {
              // metal
              // item.material = this.shaderCube.out.material
              // this.shaderCube.out.material.skinning = true

              item.material.envMap = this.shaderCube.out.envMap
              // item.frustumCulled = false
              // item.material.flatShading = true
              // item.material.roughness = 0.0
              // item.material.metalness = 1.0
            }

            if (item.isMesh && item.name === 'Mesh_0') {
              // Cloth
              // item.material = this.shaderCube.out.material
              // this.shaderCube.out.material.skinning = true

              item.material.envMap = this.shaderCube.out.envMap
              // item.frustumCulled = false
            }
          }
        })
      })
      this.$emit('configModelMat')
      model.gltfName = 'swat-guy'
      // this.gltf = model
      this.$emit('setupGLTF', model)
      this.o3d.position.x = 0
      this.o3d.position.y = 0
      this.o3d.position.z = 0
      this.o3d.rotation.x = 0
      this.o3d.rotation.y = 0
      this.o3d.rotation.z = 0
      this.o3d.children.forEach((aa) => {
        this.o3d.remove(aa)
      })
      console.log(model.scene)

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
      model.scene.traverse((item) => {
        if (item && item.name === 'mixamorigSpine2') {
          let guyCenter = new Object3D()
          guyCenter.position.y = 0
          item.add(guyCenter)
          this.$emit('guy', guyCenter)
        }

        if (item && item.name === 'mixamorigSpine') {
          let guyBack = new Object3D()
          guyBack.position.y = 0
          guyBack.position.z = 0
          item.add(guyBack)
          this.$emit('guyBack', guyBack)
        }

        if (item && item.name === 'mixamorigHead') {
          let guyFace = new Object3D()
          guyFace.position.x = 0
          guyFace.position.y = 0
          guyFace.position.z = 0
          item.add(guyFace)
          this.$emit('guyFace', guyFace)
        }

        if (item && item.name === 'mixamorigHead') {
          let guyHeadCam = new Object3D()
          guyHeadCam.position.x = 0
          guyHeadCam.position.y = 0
          guyHeadCam.position.z = -100
          item.add(guyHeadCam)
          this.$emit('guyHeadCam', guyHeadCam)
        }

        if (item && item.name === 'mixamorigHead') {
          let guyHead = new Object3D()
          guyHead.position.y = 0
          guyHead.position.z = 0
          item.add(guyHead)
          this.$emit('guyHead', guyHead)
        }

        if (item && item.name === 'mixamorigHips') {
          let guyHip = new Object3D()
          guyHip.position.y = 0
          guyHip.position.z = 0
          item.add(guyHip)
          this.$emit('guyHip', guyHip)
        }

        // console.log(item.name)
      })

      this.o3d.add(model.scene)
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
      let provideArrayBuffer = async (url) => {
        let NS = 'array-buffer-@' + url
        var store = localforage.createInstance({
          name: 'rigged-model-dancefloor'
        });
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

            let arrayBuffer = await provideArrayBuffer(url)
            let gltfobj = await modelParser(arrayBuffer)
            resolve(gltfobj)
          })
        ])

        this.configModel({
          model: all[0]
        })
      }
      loadChar()
      this.$watch('character', () => {
        loadChar()
      })
    }
  },
  mounted () {
    this.loadStuff()
  }
}
</script>

<style>

</style>
