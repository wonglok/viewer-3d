<template>
  <div class="full">
    <ArtSpacePage class="full"></ArtSpacePage>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  components: {
    ...require('~/components/pages').default
  },
  methods: {
  },
  computed: {
  },
  async asyncData({ isDev, route, store, env, params, query, req, res, redirect, error }) {
    return {}
  }
}
</script>

<style>
</style>