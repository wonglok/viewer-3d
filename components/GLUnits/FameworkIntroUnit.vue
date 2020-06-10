<template>
  <div class="w-full h-min-minus-toolbar-full">
    <div class="h-full w-full relative">


      <div class="scissor-left scissor-text flex-col justify-center items-center">
        <div class="h-24 lg:h-32 xl:h-64"></div>
        <div class="max-w-lg mx-auto px-6">
          <div class="px-3 mb-2 text-3xl md:text-4xl font-bold">
            3D FAMEWORK
          </div>

          <div class="px-3 mb-3">
            Welcome to Lok's Performant and Flexible HTML + ThreeJS 3D Composer 🥰
          </div>

          <div class="px-3 mb-3">
            Please tryout wonglok's new 3D social network which uses this. <a href="https://TogetherTime.me" class="underline">https://TogetherTime.me</a>
          </div>

          <div class="px-3 mb-3">
            The philosophy of the TogetherTime is about Loving all.
          </div>

        </div>
        <div class="h-24 lg:h-32 xl:h-64"></div>
      </div>

      <ScissorArea class="scissor-right" style="z-index: -1;">
        <div slot="dom" class="full">
        </div>
        <StarFlowScene slot="o3d"></StarFlowScene>
      </ScissorArea>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  components: {
    ...require('../webgl').default
  },
  computed: {
    ...mapState({
      profiles: state => state.domain.randomProfiles
    })
  }
}
</script>

<style scoped lang="postcss">
.scissor-text{
}
.scissor-right{
  width: 100vmin;
  height: 100vmin;
}
.scissor-left{
  width: 100%;
  height: 100%;
}

@screen lg {
  .scissor-text{
    color: black;
  }
  .scissor-right{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 50%;
    height: 100%;
    margin-left: 50%;
  }
  .scissor-left{
    /* position: absolute;
    top: 0px;
    left: 0px; */
    width: 50%;
    height: 100%;
  }
}
.h-min-minus-toolbar-full{
  min-height: calc(100% - 60px);
}
</style>
