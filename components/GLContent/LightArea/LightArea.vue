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

      // var hemLight = new HemisphereLight(0xffffbb, 0x080820, lightness)
      // this.o3d.add(hemLight)

      var directionalLight = new DirectionalLight(0xffffff, lightness)
      this.o3d.add(directionalLight)

      let light = new PointLight(0xbababa, lightness)
      light.position.set(0, 80, 20)
      this.o3d.add(light)
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style>

</style>
