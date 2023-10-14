<template>
  <div>
    <div v-if="subItems.length > 0" class="w3-padding">
      <div class="w3-padding w3-round-medium w3-teal">
        <span><b>Showing {{ searchItemsCount }} of {{ subItems.length }} sub-items for {{ tableTitle }}</b></span>
        <span> (filtered from {{ totalRecordsCount }} total records)</span>
      </div>
    </div>
    <div v-else class="w3-padding">
      <div v-if="!clearExplorerMessage" class="w3-padding w3-round-medium w3-yellow">
        <span class="w3-text-black"><b>No record(s) to display for {{ tableTitle }}</b></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, } from "vue"
import type { ObjectType } from "./types";

const totalRecordsCount = inject<number>("mcTotalRecordsCount", 0)
const searchItemsCount = inject<number>("mcSearchItemsCount", 0)
const tableTitle = inject<string>("mcTableTitle", "")
const subItems = inject<Array<ObjectType>>("mcSubItems", [])
const clearExplorerMessage = inject("mcClearExplorerMessage", false)

</script>

<style scoped>

</style>
