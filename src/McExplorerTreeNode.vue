<template>
  <div>
    <div v-if="isMessage"><span class="w3-yellow">{{ pageMessage }}</span></div>
    <div v-if="subItems.length" class="w3-bar-block">
      <div v-for="item in subItems" :key="item.id" :id="item.id">
        <div class="w3-bar-item">
          <i :id="item.id + 'Icon'" :class="setIconStyle(closedIconName).styles" style="cursor:pointer;"
             @click.prevent="onItemIconClick(item)">
            {{ setIconStyle(closedIconName).iconName }}
          </i>
          <span :id="item.id + 'Name'" class="mc-bold-label" style="cursor:pointer;"
                @click.prevent="onItemValueClick(item)"> {{ item[mainFieldName] }}</span>
          <div :id="item.id + 'Sub'" v-if="isValidSubItems(item)">
            <McExplorerTreeNode :item-id="item.id"/>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <ExplorerNoData :no-data-message="validDataMessage" :items-count="subItems.length"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExplorerNoData from "./McExplorerNoData.vue";
import { sortBy } from "lodash"; // TODO: extract/use sortBy as standalone function?
import { computed, inject, ref, unref } from "vue";
import type {
  ComputedStyle, DataField, ExplorerTreeState, MainDataField, ObjectType, SetDataItem,
  SetBoolType
} from "./types";
import { useExplorer } from "./useExplorer";

interface TreeNodeProps {
  itemId: string;
}

const props = defineProps<TreeNodeProps>()

const {uuidNullValue, computeIconStyle, closedIconName, openedIconName,} = useExplorer()
const {defaultTableStyle, defaultSortStyle, isMessage, pageMessage} = useExplorer()
const dataFields = inject<Array<DataField>>("mcDataFields", [])
const mainDataField = inject<MainDataField>("mcMainField", {name: "name"})
const parentDataField = inject<MainDataField>("mcParentField", {name: "parentId"})
const idDataField = inject<MainDataField>("mcIdField", {name: "id"})
const setDataItemValue = inject<SetDataItem>("mcSetDataItemValue")
const computedDataItems = inject<Array<ObjectType>>("mcComputedDataItems", [])
const setExplorerMessage = inject<SetBoolType>("mcSetExplorerMessage")

const explorerTreeState = ref<ExplorerTreeState>({})

// computed values
const tableFields = computed<Array<DataField>>(() => sortBy(unref(dataFields), ["order"]))

const mainFieldName = computed(() => {
  return unref(mainDataField).name
})

const parentFieldName = computed(() => {
  return unref(parentDataField).name
})

const idFieldName = computed(() => {
  return unref(idDataField).name
})

const isValidParentItem = computed<boolean>(() => {
  return !!(unref(computedDataItems).find(it => it[idFieldName.value] === props.itemId)?.id)
})

// subItems method returns the items with the parentId of the specified itemId
const subItems = computed<Array<ObjectType>>(() => {
  return unref(computedDataItems).filter(it => it.itemRecord[parentFieldName.value] === props.itemId)
})

// methods
const hasSubItems = (item: ObjectType): boolean => {
  return unref(computedDataItems).some(it => it.itemRecord[parentFieldName.value] === item[idFieldName.value])
}

const isValidSubItems = (item: ObjectType): boolean => {
  return !!explorerTreeState.value[item.id]?.status && explorerTreeState.value[item.id].status === "opened" &&
      hasSubItems(item)
}

const getSubItems = (itemId: string): Array<ObjectType> => {
  return unref(computedDataItems).filter(it => it.itemRecord[parentFieldName.value] === itemId)
}

// validDate determine the validity of the required data - mainField, tableFields & topItem
const validData = computed<boolean>(() => {
  return !!unref(mainDataField).name && tableFields.value.length > 0 && isValidParentItem.value && subItems.value.length > 0
})

// validDataMessage returns the message based on validData
const validDataMessage = computed<string>(() => {
  return validData.value ? "" : "Valid mainField, tableFields and parent(top)Item/subItems are required"
})

// set the material icon style for the specified icon-style or default for null icon-style value
const setIconStyle = (icon = "") => {
  return computeIconStyle(icon)
}

// toggleIconName method toggles the icon-name when clicked to open or close the sub-items for the specified item
const toggleIconName = (item: ObjectType): ComputedStyle => {
  const iconId = document.getElementById(`${item[idFieldName.value]}Icon`)
  let itemIconName = ""
  if (iconId) {
    const currentIconName = iconId.innerText
    itemIconName = currentIconName === closedIconName.value ? openedIconName.value : closedIconName.value
    iconId.innerText = itemIconName
  }
  return setIconStyle(itemIconName)
}

// onItemIconClick method
const onItemIconClick = (item: ObjectType) => {
  setExplorerMessage && setExplorerMessage(false)
  // toggle & set itemIconName and return the iconStyle-Name, by the toggled itemIconName
  const itemIconStyle = toggleIconName(item)
  // check current itemIcon state to show or collapse sub-items for the item
  let sItems = []
  switch (itemIconStyle.iconName) {
    case closedIconName.value:
      // update parent-item explorerTreeState
      explorerTreeState.value[item[idFieldName.value]] = explorerTreeState.value[item[idFieldName.value]] || {}
      explorerTreeState.value[item[idFieldName.value]].status = "closed"
      explorerTreeState.value[item[idFieldName.value]].iconName = itemIconStyle.iconName
      explorerTreeState.value[item[idFieldName.value]].itemStyle = itemIconStyle.styles
      explorerTreeState.value[item[idFieldName.value]].hasSubItems = sItems.length > 0
      // close sub-items for the specified parent-item
      sItems = getSubItems(item[idFieldName.value])
      for (const it of sItems) {
        const itemCompId = document.getElementById(it[idFieldName.value])
        if (itemCompId) {
          // in-activate sub-item dom-element
          itemCompId.style.display = "none"
          // update sub-item explorerTreeState
          explorerTreeState.value[it[idFieldName.value]] = explorerTreeState.value[it[idFieldName.value]] || {}
          explorerTreeState.value[it[idFieldName.value]].itemStyle = "display: 'none';"
        }
      }
      break
    case openedIconName.value:
      sItems = getSubItems(item[idFieldName.value])
      // update parent-item explorerTreeState
      explorerTreeState.value[item[idFieldName.value]] = explorerTreeState.value[item[idFieldName.value]] || {}
      explorerTreeState.value[item[idFieldName.value]].status = "opened"
      explorerTreeState.value[item[idFieldName.value]].iconName = itemIconStyle.iconName
      explorerTreeState.value[item[idFieldName.value]].itemStyle = itemIconStyle.styles
      explorerTreeState.value[item[idFieldName.value]].hasSubItems = sItems.length > 0
      // open sub-items for the specified parent-item
      for (const it of sItems) {
        const itemCompId = document.getElementById(it[idFieldName.value])
        if (itemCompId) {
          // activate sub-item dom-element
          itemCompId.style.display = "block"
          // update explorerTreeState
          explorerTreeState.value[it[idFieldName.value]] = explorerTreeState.value[it[idFieldName.value]] || {}
          explorerTreeState.value[it[idFieldName.value]].itemStyle = "display: 'block';"
        }
      }
      break
    default:
      break;
  }
}

// onItemValueClick method sets the item for explorer-table view
const onItemValueClick = (item: ObjectType) => {
  setExplorerMessage && setExplorerMessage(false)
  // capture/set the item-info (parent-item) to filter/display corresponding sub-items in the table
  setDataItemValue && setDataItemValue(item.itemRecord)
}

</script>

<style scoped>

</style>
