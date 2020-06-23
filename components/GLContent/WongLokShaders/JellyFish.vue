
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// import { ShaderMaterial, DoubleSide, SmoothShading, SphereGeometry, Mesh, AdditiveBlending, Color } from 'three'
import SpriteText from 'three-spritetext'
import { Tree, ShaderCubeChromatics, CubeCam } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, Color, MeshMatcapMaterial, TextureLoader, DoubleSide, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera, FileLoader, MeshPhysicalMaterial } from 'three'
import copy2clip from 'copy-to-clipboard'

require('requestidlecallback')
let requstIdleCallback = window.requstIdleCallback || setTimeout
let idle = (t = 0) => new Promise((resolve) => { requstIdleCallback(resolve) })

export default {
  name: 'JellyFish',
  mixins: [Tree],
  props: {
    shaderCube: {}
  },
  components: {
    ...require('../../webgl')
  },
  data () {
    return {
      cleaners: []
    }
  },
  beforeDestroy () {
    this.o3d.children.forEach((item) => {
      this.o3d.remove(item)
    })
    if (this.cleaners.lenght > 0) {
      try {
        this.cleaners.forEach(e => e())
      } catch (e) {
        console.log(e)
      }
    }
  },
  methods: {

  },
  async mounted () {
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
      name: 'rigged-jellyfish'
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

    let loadGLTF = async () => {
      let all = await Promise.all([
        new Promise(async (resolve) => {
          let url = require('file-loader!./gltf/jellyfish.glb')

          let arrayBuffer = await provideArrayBuffer(url)
          await idle()
          let gltfobj = await modelParser(arrayBuffer)
          await idle()
          resolve(gltfobj)
        })
      ])

      return all[0]
    }
    let gltf = await loadGLTF()

    console.log(gltf)

    // let cc = new CubeCam({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop, excludeFromScene: this.o3d, scene: this.lookup('scene') })
    let shaderCube = new ShaderCubeChromatics({ res: 128, renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop })
    gltf.scene.traverse((item) => {
      if (item && item.isMesh && item.material) {
        let percentage = 50
        item.geometry.translate(0, 60 / 100 * percentage, 0)
        item.geometry.scale(100 / 100 * percentage, 100 / 100 * percentage, 100 / 100 * percentage)
        item.material.skinning = true
        if (shaderCube) {
          item.material = shaderCube.out.material
          shaderCube.out.material.color = new Color('#ffffff')
        }
        // item.material = new MeshBasicMaterial({ color: 0xff0000 })
      }
    })

    let makeAuthorText = () => {
      var myText = new SpriteText('JellyFish Shader by Wong Lok')
      // myText.material.blending = AdditiveBlending
      myText.material.transparent = true
      myText.material.opacity = .5
      myText.position.y = 24
      myText.textHeight = 2.5
      myText.color = 'black'
      myText.backgroundColor = 'white'
      myText.padding = '3'

      myText.position.y = 24
      return myText
    }
    this.o3d.add(makeAuthorText())
    this.o3d.add(gltf.scene)

    this.lookup('base').onLoop(() => {
      this.o3d.rotation.y += 0.01
    })
  }
}
</script>

<style scoped>
</style>
