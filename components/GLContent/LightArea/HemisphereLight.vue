<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { HemisphereLight } from 'three'

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
      let HemisphereLight = require('three/src/lights/HemisphereLight').HemisphereLight
      var lightInstance = new HemisphereLight(0xffffff, this.intensity)
      this.o3d.add(lightInstance)
      this.$watch('intensity', () => {
        lightInstance.intensity = this.intensity
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
