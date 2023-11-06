<template>
  <a href="#" @click.prevent="itemTask(itemData)">
    {{ createLabel }} <i class="fa fa-edit"></i>
  </a>
</template>

<style>

</style>

<script setup lang="ts">
import { ref } from "vue";
import type { ItemTaskType, ObjectType } from "../types";

interface UpdatePropsType {
  itemTask: ItemTaskType;
  itemData: ObjectType;
  itemLabel?: string;
}

const props = withDefaults(defineProps<UpdatePropsType>(), {
  itemLabel: "Create",
})

const createLabel = ref(props.itemLabel)

</script>
