<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshMatcapMaterial, TextureLoader, DoubleSide, Clock, AnimationMixer } from 'three'

let loaderModel = new GLTFLoader()
// let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
    shaderCube: {
      default: false
    },
    mode: {}
  },
  components: {
    ...require('../../webgl')
  },
  methods: {
    configModel ({ model, mats }) {
      // let DirectionalLight = require('three/src/lights/DirectionalLight').DirectionalLight
      // var directionalLight = new DirectionalLight(0xffffff, 1.6)
      // this.o3d.add(directionalLight)

      // let PointLight = require('three/src/lights/PointLight').PointLight
      // let light = new PointLight(0xffffff, 2.6)
      // light.position.set(0, 20, 2.6)
      // this.o3d.add(light)

      model.scene.traverse((item) => {
        console.log(item.name)

        if (item.isMesh && item.name === 'Mesh_0') {
          // metal

          // item.material = this.shaderCube.out.material
          // this.shaderCube.out.material.skinning = true
          item.material.envMap = this.shaderCube.out.envMap
          // item.material.flatShading = true

          // item.material.roughness = 0.1
          // item.material.metalness = 0.6
        }

        if (item.isMesh && item.name === 'Mesh_1') {
          // Cloth

          // item.material.roughness = 0.1
          // item.material.metalness = 0.6

          // item.material = this.shaderCube.out.material
          // this.shaderCube.out.material.skinning = true

          item.material.envMap = this.shaderCube.out.envMap
        }
      })
      this.o3d.add(model.scene)


      // console.log(model)
      // this.o3d.add(model.scene)

      // var amb = new AmbientLight(0xffffff, 5); // soft white light
      // this.o3d.add(amb)

      // var hemLight = new HemisphereLight(0xffffbb, 0x080820, 1)
      // this.o3d.add(hemLight)

      // var directionalLight = new DirectionalLight(0xffffff, 2.6)
      // this.o3d.add(directionalLight)

      // let light = new PointLight(0xffffff, 2.6)
      // light.position.set(0, 20, 2.6)
      // this.o3d.add(light)

      // // Create an AnimationMixer, and get the list of AnimationClip instances
      // var mixer = new AnimationMixer(model.scene);
      // model.animations.forEach((clip) => {
      //   mixer.clipAction(clip).play();
      // });

      // this.lookup('base').onLoop(() => {
      //   mixer.update(16 / 1000)
      // })

      // console.log(model)
      // this.o3d.add(model.scene)

      // var ambient = new AmbientLight(0xffffff, 1); // soft white light
      // this.o3d.add(ambient)

      // var hemLight = new HemisphereLight(0xffffbb, 0x080820, 1.5)
      // this.o3d.add(hemLight)

      // var directionalLight = new DirectionalLight(0xffffff, 1.5)
      // this.o3d.add(directionalLight)

      // let light = new PointLight(0xffffff, 1.5)
      // light.position.set(0, 20, 2.6)
      // this.o3d.add(light)

      // Create an AnimationMixer, and get the list of AnimationClip instances
      var mixer = new AnimationMixer(model.scene);
      model.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });

      this.lookup('base').onLoop(() => {
        mixer.update(16.6667 / 1000)
      })
    },
    async loadStuff () {
      let shaderCube = this.shaderCube || new ShaderCube({ renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop })

      let all = await Promise.all([
        new Promise((resolve) => {
          // eslint-disable-next-line
          let url = require('file-loader!./swat/idle.glb')
          loaderModel.load(url, (v) => {
            resolve(v)
          }, (v) => {
            let manager = this.lookup('loadingManager')
            if (manager.onURL) {
              manager.onURL(url, v.loaded / v.total)
            }
            // this.loaderAPI.updateProgress(v.loaded / v.total)
          })

          // // eslint-disable-next-line
          // loaderModel.load(require('file-loader!./swat/idle.glb'), (v) => {
          //   resolve(v)
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
        model: all[0],
        mats: {
          shaderCubeMat: shaderCube.out.material,
          // red2: all[1],
          // pink2: all[2],
          // silver: all[1]
          // yellow: all[4],
          // yellow2: all[5]
        }
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
