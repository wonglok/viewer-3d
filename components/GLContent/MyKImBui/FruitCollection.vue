<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, MeshMatcapMaterial, TextureLoader, DoubleSide, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera, FileLoader } from 'three'
import 'requestidlecallback'

let loaderTex = new TextureLoader()
export default {
  name: 'Fruit',
  mixins: [Tree],
  props: {
    fruit: {
      default: 'pineapple'
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
      if (kid.geometry && kid.geometry.dispose) {
        kid.geometry.dispose()
      }
      if (kid.material && kid.material.dispose) {
        kid.material.dispose()
      }
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
          if (this.shaderCube) {
            if (item.isMesh && item.material) {
              // item.material = this.shaderCube.out.material
              // this.shaderCube.out.material.skinning = true
              item.material = new MeshBasicMaterial({ color: item.material.color })
              item.material.envMap = this.shaderCube.out.envMap
              // item.material.roughness = 0.5
              // item.material.metalness = 0.5
            }
          }
        })
      })

      this.$emit('configModelMat')
      this.$watch('shaderCube', () => {
        this.$emit('configModelMat')
      })

      model.gltfName = 'fruit'
      // this.gltf = model
      // this.$emit('setupGLTF', model)
      this.o3d.position.x = 0
      this.o3d.position.y = 0
      this.o3d.position.z = 0
      this.o3d.rotation.x = 0
      this.o3d.rotation.y = 0
      this.o3d.rotation.z = 0
      this.o3d.children.forEach((aa) => {
        this.o3d.remove(aa)
      })

      let requstIdleCallback = window.requstIdleCallback || setTimeout
      let idle = (t = 0) => new Promise((resolve) => { requstIdleCallback(resolve) })

      idle().then(() => {
        this.o3d.add(model.scene)
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
          name: 'fruit'
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
            let url = require('file-loader!./models/pineapple.glb')

            if (this.fruit === 'pineapple') {
              url = require('file-loader!./models/pineapple.glb')
            }
            if (this.fruit === 'tomato') {
              url = require('file-loader!./models/tomato.glb')
            }
            if (this.fruit === 'strawberry') {
              url = require('file-loader!./models/strawberry.glb')
            }
            if (this.fruit === 'pear') {
              url = require('file-loader!./models/pear.glb')
            }
            if (this.fruit === 'orange') {
              url = require('file-loader!./models/orange.glb')
            }
            if (this.fruit === 'lemon') {
              url = require('file-loader!./models/lemon.glb')
            }
            if (this.fruit === 'grapes') {
              url = require('file-loader!./models/grapes.glb')
            }
            if (this.fruit === 'cherry') {
              url = require('file-loader!./models/cherry.glb')
            }

            if (this.fruit === 'banana') {
              url = require('file-loader!./models/banana.glb')
            }
            if (this.fruit === 'apple') {
              url = require('file-loader!./models/apple.glb')
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
      this.$watch('fruit', () => {
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
