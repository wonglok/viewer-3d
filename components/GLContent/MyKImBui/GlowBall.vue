<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ShaderMaterial, DoubleSide, SmoothShading } from 'three'

import * as GlowBall from './GlowBall.js'
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
    async loadStuff () {
      let clean = this.clean = (cb = () => {}) => {
        this.cleaners.push(cb)
      }

      await GlowBall.makeScene({ o3d: this.o3d, clean, camera: this.lookup('camera'), loop: this.lookup('base').onLoop })
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style>

</style>
