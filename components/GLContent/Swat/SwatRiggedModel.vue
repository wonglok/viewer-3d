<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, Object3D, MeshMatcapMaterial, TextureLoader, DoubleSide, Clock, AnimationMixer, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera } from 'three'

let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
    loaderAPI: {},
    shaderCube: {
      default: false
    },
    // camera: {},
    move: {},
    scene: {},
    mode: {}
  },
  components: {
    ...require('../../webgl')
  },
  methods: {
    configModel ({ model }) {
      let guy = false
      model.scene.traverse((item) => {
        // console.log(item.name)
        // console.log(item)
        if (item && item.name === 'mixamorigHips') {
          let guyHead = new Object3D()
          guyHead.position.y = 45
          guyHead.position.z = 0
          item.add(guyHead)
          this.$emit('guy', item)
          this.$emit('guyHead', guyHead)
        }

        if (item.isMesh && item.name === 'Mesh_0') {
          // metal
          // guy = item
          // item.material = this.shaderCube.out.material
          // this.shaderCube.out.material.skinning = true

          item.material.envMap = this.shaderCube.out.envMap
          item.frustumCulled = false

          // item.material.flatShading = true
          // item.material.roughness = 0.1
          // item.material.metalness = 0.6
        }

        if (item.isMesh && item.name === 'Mesh_1') {
          // Cloth

          // item.material = this.shaderCube.out.material
          // this.shaderCube.out.material.skinning = true

          item.material.envMap = this.shaderCube.out.envMap
          item.frustumCulled = false
        }
      })



      let runAnimation = () => {
        if (this.lastMixer) {
          this.lastMixer.run = false
        }
        var mixer = new AnimationMixer(model.scene);
        mixer.run = true
        this.lastMixer = mixer
        this.move.fbx.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        let clock = new Clock()
        // let camera = this.camera
        this.lookup('base').onLoop(() => {
          if (mixer.run) {
            mixer.update(clock.getDelta())
          }
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
      setTimeout(() => {
        this.$emit('loaded')
      }, 0)
    },
    beforeDestroy() {
      this.cleanall()
      if (this.cleanLoader) {
        this.cleanLoader()
      }
    },
    async loadStuff () {
      let shaderCube = this.shaderCube || new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop })
      let loaderModel = new GLTFLoader(this.lookup('loadingManager'))
      // let loaderFBX = new FBXLoader(this.lookup('loadingManager'))

      // let breakdancesMapper = require('./breakdance/fbx').default
      // let breakdances = []
      // let i = 0
      // for (let kn in breakdancesMapper) {
      //   breakdances.push({
      //     _id: i,
      //     displayName: kn,
      //     fbx: false,
      //     url: breakdancesMapper[kn]
      //   })
      //   i++
      // }


      let all = await Promise.all([
        new Promise((resolve) => {
          let url = require('file-loader!./character/swat-guy.glb')
          // eslint-disable-next-line
          loaderModel.load(url, (v) => {
            resolve(v)
          }, (v) => {
            let manager = this.lookup('loadingManager')
            if (manager.onURL) {
              manager.onURL(url, v.loaded / v.total)
            }
            // this.loaderAPI.updateProgress(v.loaded / v.total)
          })
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
