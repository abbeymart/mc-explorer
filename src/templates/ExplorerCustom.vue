<template>
  <a href="#" @click.prevent="itemTask(itemData)">
    {{ customLabel }} <i :class="customStyle"></i>
  </a>
</template>

<style>

</style>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, ref } from "vue";
import type { ItemTaskType } from "../types";

export default defineComponent({
  name : "DatatableCustom",
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
    },
    itemType: {
      type: String,
      default: "info"
    }
  },
  setup(props) {
    // style by itemType
    const customLabel = ref(props.itemLabel || "Info")
    const customStyle = ref("fa fa-info")
    switch (props.itemType) {
      case "update":
        customStyle.value = "fa fa-edit"
            break;
      case "delete":
        customStyle.value = "fa fa-times-circle"
            break;
      case "info":
        customStyle.value = "fa fa-info"
        break;
      default:
        customStyle.value = "fa fa-info"
        break;
    }

    return {
      customLabel, customStyle,
    }
  },

})
</script>
