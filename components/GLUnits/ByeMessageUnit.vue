<template>
  <div class="px-3 max-w-xl mx-auto py-24 lg:py-32 xl:py-64">
    <div>
      <div class="px-3 mb-2 text-3xl md:text-4xl font-bold">
        Thanks for visiting us!
      </div>
      <div class="px-3 mt-1 text-gray-600">
        Let's get yours 3D Famework!! :)
      </div>
      <div class="px-3 mb-3">
        <div class="inline-block br-3 underline">
          <a target="_blank" href="https://github.com/wonglok/template-3d-famework">Project GitHub</a>
        </div>
        Or
        <div class="inline-block br-3 underline">
          <a target="_blank" href="https://www.instagram.com/wonglok831/">Follow My Instagram</a>
        </div>
      </div>
      <div class="px-3 text-sm text-gray-800">
        Best wishes,
      </div>
      <p class="px-3 text-sm">
        Wong Lok
      </p>
      <div class="px-3 text-sm text-gray-800 underline">
        <a target="_blank" href="https://www.togethertime.me">TogetherTime.me</a>
      </div>
      <div class="px-3 text-sm text-gray-800 underline">
        <a target="_blank" href="https://docs.google.com/document/d/1D2SnOOiBmjbbfJOqbTzSrRoLuicdaQ3eeocxAvJAllA/edit?usp=sharing">My Invention Porfolio</a>
      </div>

      <div class="px-3 text-sm mb-3 text-gray-800">
        P.S. Thank you Dear Jesus and Dear God for all the creative inspiration. ✞
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