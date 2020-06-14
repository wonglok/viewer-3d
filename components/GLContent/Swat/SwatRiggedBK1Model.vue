<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, MeshMatcapMaterial, TextureLoader, DoubleSide, Clock, AnimationMixer, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera, FileLoader } from 'three'

let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
    shaderCube: {
      default: false
    },
    // camera: {},
    moves: {
      default () {
        return []
      }
    },
    move: {}
  },
  components: {
    ...require('../../webgl')
  },
  methods: {
    configModel ({ model }) {
      this.$on('configModelMat', () => {
        model.scene.traverse((item) => {
          item.frustumCulled = false

          if (this.shaderCube) {
            if (item.isMesh && item.name === 'Mesh_1') {
              // metal
              // item.material = this.shaderCube.out.material
              // this.shaderCube.out.material.skinning = true

              item.material.envMap = this.shaderCube.out.envMap
              item.frustumCulled = false

              // item.material.flatShading = true
              // item.material.roughness = 0.0
              // item.material.metalness = 1.0
            }

            if (item.isMesh && item.name === 'Mesh_0') {
              // Cloth
              // item.material = this.shaderCube.out.material
              // this.shaderCube.out.material.skinning = true

              item.material.envMap = this.shaderCube.out.envMap
              item.frustumCulled = false
            }
          }
        })
      })
      this.$emit('configModelMat')

      let runAnimation = () => {
        if (this.lastMixer) {
          this.lastMixer.run = false
        }
        var mixer = new AnimationMixer(model.scene);
        mixer.run = true
        this.lastMixer = mixer
        this.move.fbx.animations.forEach((clip) => {
          let action = mixer.clipAction(clip)
          action.play();
        });

        let clock = new Clock()

        // let camera = this.camera
        // let map = new WeakMap()

        // if (actions.length >= 2) {
        //   actions.forEach(() => {
        //     action.enabled = true
        //     action.setEffectiveTimeScale( 1 );
        //     action.setEffectiveWeight( weight );
        //   })
        // }

        this.lookup('base').onLoop(() => {
          if (mixer.run) {
            mixer.update(clock.getDelta())
          }

          // model.scene.traverse((item) => {
          //   if (item && item.position) {
          //     if (map.has(item)) {
          //       map.get(item) !== item.position.x
          //       console.log(item.name)
          //     }
          //     map.set(item, item.position.x)
          //   }
          // })
        })
      }

      if (this.move && this.move.fbx && this.move.fbx.animations) {
        runAnimation()
      }
      this.$watch('move', () => {
        if (this.move && this.move.fbx && this.move.fbx.animations) {
          runAnimation()
        }
      })

      this.o3d.add(model.scene)

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
      setTimeout(() => {
        model.scene.traverse((item) => {
          console.log(item.name)
          // console.log(item)

          if (item && item.name === 'mixamorigSpine') {
            let guyCenter = new Object3D()
            guyCenter.position.y = 30
            item.add(guyCenter)
            this.$emit('guy', guyCenter)
          }

          if (item && item.name === 'mixamorigSpine') {
            let guyBack = new Object3D()
            guyBack.position.y = 30
            guyBack.position.z = -80
            item.add(guyBack)
            this.$emit('guyBack', guyBack)
          }

          if (item && item.name === 'mixamorigHead') {
            let guyFace = new Object3D()
            guyFace.position.x = 0
            guyFace.position.y = 0
            guyFace.position.z = 80
            item.add(guyFace)
            this.$emit('guyFace', guyFace)
          }

          if (item && item.name === 'mixamorigHead') {
            let guyHead = new Object3D()
            guyHead.position.y = 0
            guyHead.position.z = 0
            item.add(guyHead)
            this.$emit('guyHead', guyHead)
          }
        })
      }, 0)
    },
    beforeDestroy() {
      this.o3d.children.forEach((kid) => {
        this.o3d.remove(kid)
      })
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
          name: 'rigged-model-swat'
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

      let all = await Promise.all([
        new Promise(async (resolve) => {
          let url = require('file-loader!./character/swat-guy.glb')
          let arrayBuffer = await provideArrayBuffer(url)
          let gltfobj = await modelParser(arrayBuffer)
          resolve(gltfobj)
          // // eslint-disable-next-line
          // loaderFile.load(url, (v) => {
          //   loaderModel.parse(v, '/', (parsed) => {
          //     console.log(parsed)
          //     resolve(parsed)
          //   })
          // }, (v) => {
          //   let manager = this.lookup('loadingManager')
          //   if (manager.onURL) {
          //     manager.onURL(url, v.loaded / v.total)
          //   }
          // })
        }),

        // new Promise((resolve) => {
        //   // eslint-disable-next-line
        //   loaderTex.load(require('./matcap/red-2.jpg'), (obj) => {
        //     let result = new MeshMatcapMaterial({ transparent: true, opacity: 1.0, color: 0xffffff, matcap: obj })
        //     resolve(result)
        //   })
        // }),
        // new Promise((resolve) => {
        //   // eslint-disable-next-line
        //   loaderTex.load(require('./matcap/pink-2.jpg'), (obj) => {
        //     let result = new MeshMatcapMaterial({ transparent: true, opacity: 1.0, color: 0xffffff, matcap: obj })
        //     resolve(result)
        //   })
        // }),
        // new Promise((resolve) => {
        //   // eslint-disable-next-line
        //   loaderTex.load(require('./matcap/silver.png'), (obj) => {
        //     let result = new MeshMatcapMaterial({ transparent: true, opacity: 1.0, color: 0xffffff, matcap: obj })
        //     resolve(result)
        //   })
        // }),
        // new Promise((resolve) => {
        //   // eslint-disable-next-line
        //   loaderTex.load(require('./matcap/yellow.jpg'), (obj) => {
        //     let result = new MeshMatcapMaterial({ transparent: true, opacity: 1.0, color: 0xffffff, matcap: obj })
        //     resolve(result)
        //   })
        // }),

        // new Promise((resolve) => {
        //   let link = `https://res.cloudinary.com/loklok-keystone/image/upload/v1590477810/loklok/matcap/silver.png`
        //   // eslint-disable-next-line
        //   loaderTex.load(link || require('./matcap/silver.png'), (obj) => {
        //     let result = new MeshMatcapMaterial({ transparent: true, opacity: 1.0, color: 0xeeeeee, matcap: obj })
        //     resolve(result)
        //   })
        // })
      ])

      this.configModel({
        model: all[0]
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
