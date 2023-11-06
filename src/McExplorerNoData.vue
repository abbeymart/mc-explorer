<template>
  <div>
    <div v-if="itemsCount < 1" class="w3-container w3-yellow">
      <h4>... {{ props.noDataMessage }} ...</h4>
    </div>
    <div v-else>
      <h4>... {{ props.loadingDataMessage }} ...</h4>
    </div>
  </div>
</template>

<script setup lang="ts">

export interface NoDataProps {
  noDataMessage?: string;
  loadingDataMessage?: string;
  itemsCount: number;
}

const props = withDefaults(defineProps<NoDataProps>(), {
  noDataMessage     : "No data/records available to display",
  loadingDataMessage: "Loading... Unable to process data. Ensure that you're logged in",
})

</script>

<style scoped>

</style>
