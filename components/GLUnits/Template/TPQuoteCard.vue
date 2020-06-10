<template>
  <div class="p-2 border border-gray-500 bg-gray-100 inline-block rounded-lg max-w-xs md:max-w-md lg:max-w-xs">
    <div class="p-3 border border-gray-500 bg-white rounded-lg">
      <div class="mb-3">
        {{ card.quote }}
      </div>
      <div class="text-sm text-gray-600 text-right">
        - {{ card.author }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    card: {}
  }
}
</script>