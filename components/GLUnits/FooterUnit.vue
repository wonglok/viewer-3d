<template>
  <div class="">

    <div class="flex flex-col lg:flex-row">

      <div class="lg:w-1/2 relative minh100">
        <ScissorArea class="h-full w-full" style="z-index: -1;">
          <div slot="dom" class="full">
          </div>
          <SpacewalkScene slot="o3d"></SpacewalkScene>
        </ScissorArea>
      </div>
      <div class="lg:w-1/2 relative">
        <ByeMessageUnit></ByeMessageUnit>
      </div>
    </div>

  </div>
</template>

<script>
// import { Auth } from '../../../APIs/KA'

export default {
  components: {
    ...require('../webgl').default
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="postcss">
.minh100{
  height: 100vmin;
}
</style>
