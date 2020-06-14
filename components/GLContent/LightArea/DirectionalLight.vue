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
    intensity: {
      default: 3.6
    }
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
      let DirectionalLight = require('three/src/lights/DirectionalLight').DirectionalLight
      var directionalLight = new DirectionalLight(0xffffff, this.intensity)
      this.o3d.add(directionalLight)
      this.$watch('intensity', () => {
        directionalLight.intensity = this.intensity
      })
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style>

</style>
