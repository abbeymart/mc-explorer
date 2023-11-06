<template>
  <div>
    <div v-if="validData" class="w3-bar-block">
      <div v-for="item in topItems" :key="item.id" :id="item.id">
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
      <ExplorerNoData :no-data-message="validDataMessage" :items-count="topItems.length"/>
    </div>
    <div v-if="isMessage">
      <span class="w3-yellow">{{ pageMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExplorerNoData from "./McExplorerNoData.vue";
import { sortBy } from "lodash"; // TODO: extract/use sortBy as standalone function?
import { computed, inject, provide, ref, unref } from "vue";
import type {
  ComputedStyle, DataField, ExplorerTreeState, MainDataField, ObjectType, SetDataItem, SetBoolType,
} from "./types";
import { useExplorer } from "./useExplorer";
import McExplorerTreeNode from "./McExplorerTreeNode.vue";

const {uuidNullValue, computeIconStyle, closedIconName, openedIconName} = useExplorer()
const {isMessage, pageMessage} = useExplorer()
const dataFields = inject<Array<DataField>>("mcDataFields", [])
const mainDataField = inject<MainDataField>("mcMainField", {name: "name"})
const parentDataField = inject<MainDataField>("mcParentField", {name: "parentId"})
const idDataField = inject<MainDataField>("mcIdField", {name: "id"})
const setDataItemValue = inject<SetDataItem>("mcSetDataItemValue")
const categoryItems = inject<Array<ObjectType>>("mcCategoryItems", [])
const setExplorerMessage = inject<SetBoolType>("mcSetExplorerMessage")

const explorerTreeState = ref<ExplorerTreeState>({})

// computed values
const tableFields = computed<Array<DataField>>(() => sortBy(unref(dataFields), ["order"]))

const computedDataItems = computed<Array<ObjectType>>(() => {
  // transform categoryItems fields, and include the original itemRecord
  return unref(categoryItems).map(item => {
    // clone the item for computation && include original itemRecord
    const itemData = Object.assign({}, item, {itemRecord: {...item}});
    tableFields.value.forEach(field => {
      if (field.source.type && field.source.type === "provider") {
        if (field.source.params) {
          // compute field-param-values for the transform function
          let fieldParamValues: Array<any> = []
          for (const param of field.source.params) {
            if (param === "item" || param === "record") {
              fieldParamValues.push(itemData)
            } else {
              fieldParamValues.push(itemData[param])
            }
          }
          if (field.source.transform && typeof field.source.transform === "function") {
            itemData[field.name] = field.source.transform(...fieldParamValues);
          }
        } else if (field.source.transform && typeof field.source.transform === "function") {
          itemData[field.name] = field.source.transform(itemData[field.name]);
        }
      }
    });
    return itemData;
  });
})

const hasSubItems = (item: ObjectType): boolean => {
  return computedDataItems.value.some(it => it.itemRecord[parentFieldName.value] === item[idFieldName.value])
}

const mainFieldName = computed(() => {
  return unref(mainDataField).name
})

const parentFieldName = computed(() => {
  return unref(parentDataField).name
})

const idFieldName = computed(() => {
  return unref(idDataField).name
})

const isValidSubItems = (item: ObjectType): boolean => {
  return !!explorerTreeState.value[item.id]?.status && explorerTreeState.value[item.id].status === "opened" &&
      hasSubItems(item)
}

// topItems
const topItems = computed(() => {
  return computedDataItems.value.filter(it => !it.itemRecord[parentFieldName.value] || it.itemRecord[parentFieldName.value] === "" || it.itemRecord[parentFieldName.value] === uuidNullValue)
})

const getSubItems = (itemId: string): Array<ObjectType> => {
  return unref(computedDataItems).filter(it => it.itemRecord[parentFieldName.value] === itemId)
}

// validDate determine the validity of the required data - mainField, tableFields & topItems
const validData = computed<boolean>(() => {
  return !!unref(mainDataField).name && tableFields.value.length > 0 && topItems.value.length > 0
})

// validDataMessage returns the message based on validData
const validDataMessage = computed<string>(() => {
  return validData.value ? "" : "Valid mainField, tableFields and dataItems/topItems are required"
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

provide("mcComputedDataItems", computedDataItems) // for TreeNode sub-component

</script>

<style scoped>

</style>
