<template>
  <div class="px-3 max-w-xl mx-auto py-24 lg:py-32 xl:py-64">
    <div>
      <div class="px-3 mb-2 text-3xl md:text-4xl font-bold">
        Running
      </div>
      <div class="px-3 mt-1 text-gray-600">
        Testing...
      </div>
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
      // isHub: state => state.domain.config.isHub,
    })
  }
}
</script>

<style>

</style>