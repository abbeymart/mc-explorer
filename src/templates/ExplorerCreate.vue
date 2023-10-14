<template>
  <a href="#" @click.prevent="itemTask(itemData)">
    {{ updateLabel }} <i class="fa fa-edit"></i>
  </a>
</template>

<style>

</style>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent } from "vue";
import type { ItemTaskType } from "../types";

export default defineComponent({
  name : "DatatableUpdate",
  props: {
    itemTask : {
      type    : Function as PropType<ItemTaskType>,
      required: true,
    },
    itemData : {
      type    : Object,
      required: true,
    },
    itemLabel: {
      type   : String,
      default: "",
    }
  },
  setup(props) {
    return {
      updateLabel: props.itemLabel || "Update",
    }
  },

})
</script>
