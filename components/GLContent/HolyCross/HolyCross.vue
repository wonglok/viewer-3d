<template>
  <div>
    <O3D :animated="true" layout="cross" @o3d="setup">
    </O3D>
    <slot></slot>
  </div>
</template>

<script>
import { Tree, ShaderCube } from '../../Reusable'
import { MeshMatcapMaterial, DoubleSide, Object3D, TextureLoader } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// import { Refractor } from 'three/examples/jsm/objects/Refractor'
// import { FastBlurShader } from './FastBlurShader'

let texLoader = new TextureLoader()
let fbxLoader = new FBXLoader()

let Matcap = {}

export default {
  name: 'HolyCross',
  mixins: [Tree],
  props: {
    shaderCube: {
      default: false
    },
    depth: {
      default: 20
    },
    color: {
      default: 0x999999
    }
  },
  components: {
    O3D: require('../../Reusable/O3D').default,
    ...require('../../webgl')
  },
  data () {
    return {
      stub: {},
      grouper: new Object3D()
    }
  },
  methods: {
    setup (mounter3D) {
      // let cubeLoader = new CubeTextureLoader()

      let load = (loader, url) => {
        return new Promise((resolve) => {
          loader.load(url, (group) => {
            resolve(group)
          })
        })
      }

      let shaderCube = new ShaderCube({ res: 128, renderer: this.lookup('renderer'), loop: this.lookup('base').onLoop })
      // Matcap.brown = new MeshMatcapMaterial({ color: 0xbababa, side: DoubleSide, matcap: texLoader.load(require('./matcap/white.png')) })
      // Matcap.silver = new MeshMatcapMaterial({ color: 0xffffff, side: DoubleSide, matcap: texLoader.load(require('./matcap/silver.png')) })
      // Matcap.pedals = new MeshMatcapMaterial({ color: 0xffffff, side: DoubleSide, matcap: texLoader.load(require('./matcap/pink.jpg')) })

      this.lookup('base').onLoop(() => {
        let scale = 1.0
        this.layouts = {
          cross: {
            rx: Math.PI * 0.5,
            ry: -0.5,
            rz: 0.0,

            // px: `screen.min`,
            py: `200`,
            pz: `300`,

            sx: `${scale}`,
            sy: `${scale}`,
            sz: `${scale}`
          }
        }
      })

      this.$on('init', async () => {
        // eslint-disable-next-line
        let holyCross = await load(fbxLoader, require('file-loader!./fbx/holy-cross.fbx'))
        console.log('holy', holyCross)
        holyCross.traverse((item) => {
          if (item.isMesh) {
            item.frustumCulled = false
            // console.log(item.name)
            // if (item.name.indexOf('Cube') !== -1) {
            //   item.material = Matcap.silver

            //   if (shaderCube) {
            //     console.log(shaderCube)
            //     item.material = shaderCube.out.material
            //   }
            // }
            if (shaderCube) {
              console.log(shaderCube)
              item.material = shaderCube.out.material
            }
            // if (item.name.indexOf('Sphere') !== -1) {
            //   item.material = Matcap.silver
            // }
            // if (item.name.indexOf('BezierCurve') !== -1) {
            //   item.material = Matcap.brown
            // }
          }
        })

        mounter3D.add(holyCross)
      })

      this.$emit('init')
    }
  },
  async mounted () {

  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
