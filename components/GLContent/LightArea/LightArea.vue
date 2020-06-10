<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { PointLight, DirectionalLight, HemisphereLight, AmbientLight } from 'three'

// let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
  },
  components: {
    ...require('../../webgl')
  },
  beforeDestroy () {
    this.o3d.children.forEach((item) => {
      this.o3d.remove(item)
    })
  },
  methods: {
    configModel ({ model, mats }) {

    },
    async loadStuff () {
      let lightness = 0.8
      var ambient = new AmbientLight(0xffffff, lightness * 2); // soft white light
      this.o3d.add(ambient)

      var directionalLight = new DirectionalLight(0xffffff, lightness)
      this.o3d.add(directionalLight)

      let light = new PointLight(0xbababa, lightness)
      light.position.set(0, 20, -80)
      this.o3d.add(light)


      let ptLight2 = new PointLight(0xbababa, lightness)
      ptLight2.position.set(0, 80, 80)
      this.o3d.add(ptLight2)
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style>

</style>
