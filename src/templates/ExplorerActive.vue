<template>
  <td>
    <span v-if="isActive">{{ yesLabel }} <i class="fa fa-check"></i></span>
    <span v-else>{{ noLabel }} <i class="fa fa-power-off"></i></span>
  </td>
</template>
<style>

</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name : "DatatableActive",
  props: {
    isActive     : {
      type   : Boolean,
      default: false,
    },
    activeLabel  : {
      type   : String,
      default: "",
    },
    inActiveLabel: {
      type   : String,
      default: "",
    }
  },
  setup(props) {
    return {
      yesLabel: props.activeLabel || "Yes",
      noLabel : props.inActiveLabel || "No",
    }
  },

})
</script>
