<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Mesh, MeshMatcapMaterial, TextureLoader, DoubleSide, Clock, AnimationMixer, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Camera } from 'three'

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
          this.$emit('guy', item)
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
      this.o3d.add(model.scene)
      // this.lookupWait('canMount').then(() => {
      // })


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

        // let camera = this.camera
        this.lookup('base').onLoop(() => {
          if (mixer.run) {
            mixer.update(16.6667 / 1000)
          }
          // model.scene.traverse((item) => {
          //   if (item.position.x !== 0 && item.position.x !== item.oldpx) {
          //     console.log(item.position.x, item.name)
          //     item.oldpx = item.position.x
          //   }
          // })
          // if (guy) {
          //   var relativeCameraOffset = new Vector3(0,50,300);

          //   var cameraOffset = relativeCameraOffset.applyMatrix4( guy.matrixWorld );

          //   // camera.position.x += cameraOffset.x;
          //   // camera.position.y += cameraOffset.y;
          //   // camera.position.z += cameraOffset.z;
          //   camera.lookAt(guy.position);

          //   // // console.log(guy.position.z)
          //   // // var relativeCameraOffset = new Vector3(0,50,200);

          //   // // var cameraOffset = relativeCameraOffset.applyMatrix4(model.scene.matrixWorld)

          //   // // camera.position.x = cameraOffset.x
          //   // // camera.position.y = cameraOffset.y
          //   // // camera.position.z = cameraOffset.z
          //   // // camera.lookAt(model.scene.position)

          //   // goto.position.copy(guy.position).add(new Vector3(0, 30, -330))
          //   // this.camera.position.lerp(goto.position, 0.2)
          // }
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
