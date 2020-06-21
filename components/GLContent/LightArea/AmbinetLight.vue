<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { AmbientLight } from 'three'

// let loaderTex = new TextureLoader()
export default {
  name: 'Swat',
  mixins: [Tree],
  props: {
    intensity: {
      defult: 3
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
      var ambient = new AmbientLight(0xffffff, this.intensity); // soft white light
      this.$watch('intensity', () => {
        ambient.intensity = this.intensity
      })
      this.o3d.add(ambient)
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style>

</style>
