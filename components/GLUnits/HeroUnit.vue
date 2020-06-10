<template>
  <div class="full">
    <ScissorArea class="webgl-banner">
      <div slot="dom" class="relative full">
      </div>
      <BannerScene slot="o3d"></BannerScene>
    </ScissorArea>
  </div>
</template>

<script>
// import { Auth } from '../../../APIs/KA'
import { Tree } from '../Reusable'

export default {
  mixin: [Tree],
  components: {
    ...require('../webgl').default
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="postcss" scoped>
.webgl-banner{
  height: 100vmin;
}
@screen lg {
  .webgl-banner{
    height: 70vmin;
  }
}
.textshadow{
  text-shadow: 0px 0px 10px #ffffff, 0px 0px 10px #ffffff, 0px 0px 10px #ffffff;
}
</style>
