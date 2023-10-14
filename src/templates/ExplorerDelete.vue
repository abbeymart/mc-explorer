<template>
  <a href="#" @click.prevent="itemTask(itemId)">
    {{ deleteLabel }} <i class="fa fa-times-circle"></i>
  </a>
</template>

<style>

</style>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent } from "vue";
import type { ItemTaskType } from "../types";

export default defineComponent({
  name : "DatatableDelete",
  props: {
    itemTask : {
      type    : Function as PropType<ItemTaskType>,
      required: true,
    },
    itemId   : {
      type    : String,
      required: true,
    },
    itemLabel: {
      type   : String,
      default: "",
    }
  },
  setup(props) {
    return {
      deleteLabel: props.itemLabel || "Delete",
    }
  },

})
</script>
