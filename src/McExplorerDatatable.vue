<template>
  <div>
    <div v-if="validData" class="w3-container">
      <div class="w3-container w3-row-padding w3-margin w3-light-gray w3-round-medium">
        <button class="w3-button w3-teal w3-xlarge w3-left" @click.prevent="openMenu" style="display: none"
                id="openBtn">&#9776;
        </button>
        <div class="w3-right">
          <McExplorerMessage/>
        </div>
      </div>
      <div class="w3-container mc-explorer-flex-wrap">
        <div class="mc-explorer-left-box" id="mc-explorer-tree">
          <button class="w3-button w3-large mc-bold-label" @click.prevent="closeMenu" style="display: block"
                  id="closeBtn">Close &times;
          </button>
          <McExplorerTree/>
        </div>
        <div class="mc-explorer-right-box" id="mc-explorer-table">
          <div v-if="!!updateTask && !!dataItem?.id" class="w3-padding w3-round-medium w3-border-bottom">
            <a href="#" @click.prevent="updateItem(dataItem)" class="mc-bold-label">
              {{ parentItemRecord }} <i class="fa fa-edit"></i> {{ itemDescription }}
            </a>
          </div>
          <div v-if="subItemsCount > 0">
            <McExplorerDataTable id="mcItemTable"
                         :data-fetch-alert="dataFetchAlert!"
                         :data-fields="dataFields"
                         :data-items="subItems"
                         :data-stats="dataStats"/>
          </div>
          <div v-else class="w3-container w3-padding w3-margin">
            <McTableNoData/>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <McExplorerNoData :no-data-message="invalidDataMessage" :items-count="dataItems.length"/>
    </div>
  </div>
</template>

<script setup lang="ts">
// sub-components
import McExplorerMessage from "./McExplorerMessage.vue";
import McExplorerNoData from "./McExplorerNoData.vue";
import McExplorerTree from "./McExplorerTree.vue";
import { McExplorerDataTable, McTableNoData } from "@mconnect/mc-data-table"

import { computed, onMounted, provide, ref, unref, watch } from "vue";
import type {
  DataFetchAlert, DataFetchAlertResult, DataField, DataStats, MainDataField, ObjectType, PermitSaveDelete,
  PermittedEvents, SortStyle, TableStyle, TaskUpdate,
} from "./types";
import { useExplorer } from "./useExplorer";
import { shortString } from "./utils";

interface ExplorerPropsType {
  dataFields: Array<DataField>;
  mainField: MainDataField;
  parentField?: MainDataField;  // default parentField.name = "parentId"
  idField?: MainDataField;  // default idField.name = "id"
  dataItems: Array<ObjectType>;
  dataStats: DataStats;
  dataFetchAlert: DataFetchAlert;
  targetField: MainDataField;     // sub-items reference/target-field/column name used to filter the data-items that belongs to a category
  sourceField: MainDataField;     // source/category-field/column name used to filter the data-items that belongs to a category
  sourceUpdateFunc?: TaskUpdate;
  categoryItems: Array<ObjectType>;
  categoryStats?: DataStats;
  categoryFetchAlert?: DataFetchAlert;
  permitSaveDelete?: PermitSaveDelete;
  permitSaveDeleteMessage?: string;
  paging?: boolean;
  pageStart?: number;
  pageLimits?: Array<number>;
  tableStyle?: TableStyle;
  sortStyle?: SortStyle;
  permittedEvents?: Array<PermittedEvents>;
  noDataMessage?: string;
  loadingDataMessage?: string;
}

const props = withDefaults(defineProps<ExplorerPropsType>(), {
  permitSaveDeleteMessage: "Update and Delete tasks are not permitted",
  paging                 : true,
  pageStart              : 1,
  pageLimits             : () => [10, 20, 30, 50, 100, 200],
  tableStyle             : () => {
    return {
      table      : "w3-table w3-striped w3-border w3-bordered w3-hoverable",
      tableHeader: "w3-red",
      tableBody  : "w3-hover",
    }
  },
  sortStyle              : () => {
    return {
      asc : "keyboard_arrow_up",
      desc: "keyboard_arrow_down",
    }
  },
  permittedEvents        : () => ["click", "mouseover", "mouseleave", "mouseenter"],
  noDataMessage          : "No data available to display",
  loadingDataMessage     : "Loading or Unable to process data. Ensure that you're logged in",
})


// reactive params for datatable
const {
  dataFields, mainField, dataTotal, dataItemsCount, searchKey, setCurrentPage, setDataItemsCount,
  pageLimit, currentPage, tableStyle, sortStyle, dataItems, permittedEvents, setDataItemsValue,
  setSearchItemsCount, searchItemsCount, dataStats, dataFetchAlert, pageLimits, setPageLimit,
  totalRecordsCount, setSearchKeyValue, startPage, endPage, setStartPage, setEndPage,
  savedCurrentPage, setSavedCurrentPage, lastPage, setLastPage, getLocalStorage, setLocalStorage,
  permitSaveDelete, permitSaveDeleteMessage, setDataItemValue, dataItem, getCurrentPage,
  categoryItems, sourceField, targetField, parentField, idField, sourceUpdateFunc,
} = useExplorer(props)

const endOfSubItemsPage = ref(false)
const invalidDataMessage = ref("")
const loadingDataMessage = ref("")
const previousPage = ref<number>()
const nextPage = ref<number>()
const menuOpen = ref(false)
const clearExplorerMessage = ref(false)

const totalRecsCount = ref<number>(props.dataStats.totalRecordsCount || 0)

const updateTask = ref<TaskUpdate>()

const updateItem = (val: ObjectType) => {
  updateTask.value && updateTask.value(val)
}

watch([dataItem], ([val]) => {
  if (val["id"]) {
    // const itemInfo = dataFields.value.find(it => it["name"] === "update")
    // set source/category/tree record update-function
    updateTask.value = sourceUpdateFunc.value
    // update calling component source-item-id
    !!mainField.value?.SetFieldId && mainField.value?.SetFieldId(val["id"])
  }
}, {immediate: true})

const subItems = computed(() => {
  return dataItem.value && dataItem.value[sourceField.value?.name || "categoryId"] ?
      dataItems.value.filter(it => it[targetField.value?.name || "categoryId"] === dataItem.value[sourceField.value?.name || "id"]) :
      []
})

const subItemsCount = computed(() => {
  return subItems.value.length
})

const tableTitle = computed(() => {
  return mainField.value?.name && dataItem.value ? `${(dataItem.value[mainField.value.name])?.toUpperCase()}` : " N/A"
})

const itemDescription = ref("")
const descLength = ref(40)
const parentItemRecord = computed(() => {
  // include item description, i.e all dataFields, except select/update/delete/isActive
  let itemText = ""
  const itemNameField = dataFields.value.find(it => it.name === "name")
  const itemDescField = dataFields.value.find(it => it.name === "description" || it.name === "desc")
  let itemName = ""
  let itemDesc = ""
  if (itemNameField) {
    itemName = `${dataItem.value[itemNameField.name]}`
    // itemText = itemName? (itemText? `${itemText} :: ${itemName}` : `${itemName}`): ""
  }
  if (itemDescField) {
    itemDesc = `${dataItem.value[itemDescField.name]}`
    itemText = itemDesc ? (itemText ? `${itemText} :: ${shortString(itemDesc, descLength.value)}` :
        `${shortString(itemDesc, descLength.value)}`) : ""
  }
  itemDescription.value = itemText ? `[${itemText}]` : ""
  return itemName ? `${itemName} Sub-Items ` : `${unref(tableTitle)} Sub-Items `
})

// instance computed values, methods, lifecycles etc. | dataCount => dataItemsCount
const recordTotal = computed(() => dataTotal.value ? dataTotal.value : dataItemsCount.value)

// validate required fields/values from dataItems
const validData = computed<boolean>(() => {
  const mainDataField = mainField.value?.name || ""
  const sourceItemField = sourceField.value?.name || ""
  const targetItemField = targetField.value?.name || ""

  const categoryItem = categoryItems.value[0] || props.categoryItems[0]
  const categoryItemFields = Object.keys({...categoryItem})
  if (dataItems.value.length < 1) {
    return !!mainDataField && !!sourceItemField && !!targetItemField && categoryItemFields.includes(mainDataField) &&
        categoryItemFields.includes(sourceItemField)
  }
  // include optional dataItems validation
  const dataItem = dataItems.value[0] || props.dataItems[0]
  const dataItemFields = Object.keys({...dataItem})
  return !!mainDataField && !!sourceItemField && !!targetItemField && categoryItemFields.includes(mainDataField) &&
      categoryItemFields.includes(sourceItemField) && dataItemFields.includes(targetItemField) && recordTotal.value > 0
})

const openMenu = () => {
  clearExplorerMessage.value = true
  const tableId = document.getElementById("mc-explorer-table")
  const menuId = document.getElementById("mc-explorer-tree")
  const openId = document.getElementById("openBtn")
  !!menuId ? menuId.style.display = "block" : ""
  !!openId ? openId.style.display = "none" : ""
  !!tableId ? tableId.classList.remove("mc-explorer-right-box-100") : ""
  !!tableId ? tableId.classList.add("mc-explorer-right-box") : ""
  menuOpen.value = true
}

const closeMenu = () => {
  clearExplorerMessage.value = true
  const tableId = document.getElementById("mc-explorer-table")
  const menuId = document.getElementById("mc-explorer-tree")
  const openId = document.getElementById("openBtn")
  !!menuId ? menuId.style.display = "none" : ""
  !!openId ? openId.style.display = "block" : ""
  !!tableId ? tableId.classList.remove("mc-explorer-right-box") : ""
  !!tableId ? tableId.classList.add("mc-explorer-right-box-100") : ""
  menuOpen.value = false
}

// check initial menuState
onMounted(() => {
  if (!menuOpen.value) {
    // display menu | hide open-btn
    openMenu()
  } else {
    // close menu | display open-btn
    closeMenu()
  }
})

watch([props], async ([val]) => {
  useExplorer(val);
  setDataItemsCount();
  setCurrentPage(1)
  searchKey.value = ""
  dataItems.value = val.dataItems
  dataTotal.value = val.dataItems.length
  dataStats.value = val.dataStats
  categoryItems.value = val.categoryItems
  const skip = val.dataStats.skip || 0
  const limit = val.dataStats.limit || 10000
  totalRecsCount.value = val.dataStats.totalRecordsCount || totalRecordsCount.value || 0
  const dTotal = dataTotal.value || 0
  if (skip === 0 || skip <= pageLimit.value || skip < limit) {
    setStartPage(1)
  } else {
    setStartPage(Math.ceil((skip + 1) / pageLimit.value))
  }
  setEndPage(Math.ceil((skip + dTotal) / pageLimit.value)) // endPage for the current dataFetch (skip + dataTotal)
  setLastPage(Math.ceil(totalRecsCount.value / pageLimit.value))
  dataFields.value = val.dataFields
  sourceField.value = val.sourceField
  targetField.value = val.targetField
  if (props.sourceUpdateFunc) {
    sourceUpdateFunc.value = props.sourceUpdateFunc
  }
  parentField.value = val.parentField || {name: "parentId"}
  idField.value = val.idField || {name: "id"}
  dataFetchAlert.value = val.dataFetchAlert
  permitSaveDelete.value = val.permitSaveDelete
  permitSaveDeleteMessage.value = val.permitSaveDeleteMessage
  pageLimits.value = val.pageLimits
  tableStyle.value = val.tableStyle
  sortStyle.value = val.sortStyle
  permittedEvents.value = val.permittedEvents
  // set the saveCurrentPage based on storedValue, relative to startPage and endPage
  const sCPage = getLocalStorage("currentPage")
  if (sCPage && parseInt(sCPage)) {
    let sCPageVal = parseInt(sCPage)
    if (sCPageVal < startPage.value) {
      sCPageVal = startPage.value
    } else if (sCPageVal > endPage.value) {
      sCPageVal = endPage.value
    }
    savedCurrentPage.value = sCPageVal
    setLocalStorage("currentPage", sCPageVal)
  }
}, {immediate: true})

watch([pageLimit], ([val], [oVal]) => {
  if (val != oVal) {
    setLastPage(Math.ceil(totalRecsCount.value / val))
  }
}, {immediate: true})

watch([validData], ([val]) => {
  if (!val) {
    invalidDataMessage.value = `Valid mainField, sourceField, targetField for matching category-dataFields and dataItem records are required`
    loadingDataMessage.value = `Loading or Unable to process data. Ensure that you're logged in. ${invalidDataMessage.value}`
  }
}, {immediate: true})

watch([subItemsCount], ([val]) => {
  if (val < 1) {
    setSearchItemsCount(val)
    invalidDataMessage.value = `No data/records available to display`
    loadingDataMessage.value = `No data/records available to display.`
  }
}, {immediate: true})

// watch to perform fetch previous or next batch of records/data
watch([dataItemsCount, endOfSubItemsPage], ([countVal, eSubPage]) => {
  const totalRecCount = dataStats.value.totalRecordsCount
  const currentPageVal = getCurrentPage() || savedCurrentPage.value || currentPage.value
  if (eSubPage && totalRecCount && totalRecCount > countVal && currentPageVal === nextPage.value) {
    // set the dataFetchAlertResult object | adjust skip/limit for forward/backward currentPage
    let skip = dataStats.value.skip || 0
    let limit = dataStats.value.limit || dataTotal.value
    // set skip value for the next (or previous) batch of data-records-fetch
    // startPage => start page # of the current skip-to-limit batch records
    // endPage => end page # of the current skip-to-limit batch records
    if (currentPageVal < startPage.value) {
      skip = (skip - limit) <= 0 ? 0 : (skip - limit);
    } else if (currentPageVal > endPage.value) {
      skip = skip + limit;
    }
    const val: DataFetchAlertResult = {
      skip        : skip,
      limit       : limit,
      fetchAlert  : true,
      currentStats: {
        startPage     : startPage.value,
        endPage       : endPage.value,
        currentPage   : currentPage.value,
        dataItemsTotal: totalRecordsCount.value,
      }
    }
    dataFetchAlert.value && dataFetchAlert.value(val)
  }
}, {immediate: true})

// table-section: set screen-parameters to support explorer-table data-items display, by screen-scrolling
const tableId = document.getElementById("mc-explorer-table")

// current table-window scroll position
const currentPosition = computed(() => {
  return tableId ? tableId.scrollHeight : 0
  // return tableId ? Math.max(tableId.scrollHeight, tableId.clientHeight, tableId.offsetHeight) : 0
})
// endOfPage1.value = window.innerHeight + window.scrollY >= document.body.offsetHeight;
// determine endOfPage to set the currentPage+ and load next data-records
const endOfPage = computed(() => {
  if (tableId) {
    const pos = tableId.scrollHeight + tableId.scrollTop
    const nextPos = tableId.offsetHeight
    return pos >= nextPos
  }
  return false
})

// determine beginOfPage to set the currentPage- and load previous data-records
const beginOfPage = computed(() => {
  // return tableId ? tableId.scrollHeight + tableId.scrollTop < tableId.offsetHeight : false
  if (tableId) {
    const pos = tableId.scrollHeight + tableId.scrollTop
    const nextPos = tableId.offsetHeight
    return pos < nextPos
  }
  return false
})

const setEndOfSubItemsPage = (val: boolean) => {
  endOfSubItemsPage.value = val
}

const setPreviousPage = (val: number) => {
  return previousPage.value = val
}

const setNextPage = (val: number) => {
  return nextPage.value = val
}

const setExpMessage = (val: boolean) => {
  clearExplorerMessage.value = val
}

// adjust currentPage by scroll-position - scroll forward(currentPage+) & backward(currentPage-)
watch([endOfPage, beginOfPage], ([ePVal, bPVal]) => {
  if (ePVal && tableId) {
    // increment currentPage
    const pos = tableId.scrollHeight + tableId.scrollTop
    const nextPos = tableId.offsetHeight
    const currentPageVal = getCurrentPage() || savedCurrentPage.value || currentPage.value
    if (pos >= nextPos) {
      setCurrentPage(currentPageVal + 1)
    }
  } else if (bPVal && tableId) {
    // decrement currentPage
    const pos = tableId.scrollHeight + tableId.scrollTop
    const nextPos = tableId.offsetHeight
    const currentPageVal = getCurrentPage() || savedCurrentPage.value || currentPage.value
    if (pos < nextPos && currentPageVal > 1) {
      setCurrentPage(currentPageVal - 1)
    }
  }
}, {immediate: true})

// Provide reactive items to be injected into child-components
provide("mcTableStyle", tableStyle)
provide("mcSortStyle", sortStyle)
provide("mcDataFields", dataFields)
provide("mcMainField", mainField)
provide("mcDataItems", dataItems)
provide("mcDataItem", dataItem)
provide("mcDataStats", dataStats)
provide("mcDataFetchAlert", dataFetchAlert)
provide("mcSourceField", sourceField)
provide("mcTargetField", targetField)
provide("mcSourceUpdateFunc", sourceUpdateFunc)
provide("mcParentField", parentField)
provide("mcIdField", idField)
provide("mcCategoryItems", categoryItems)
provide("mcPermitSaveDelete", permitSaveDelete)
provide("mcPermitSaveDeleteMessage", permitSaveDeleteMessage)
provide("mcPageLimit", pageLimit)
provide("mcCurrentPage", currentPage)
provide("mcSearchKey", searchKey)
provide("mcSearchItemsCount", searchItemsCount)
provide("mcDataTotal", dataTotal)
provide("mcPageLimits", pageLimits)
provide("mcPermittedEvents", permittedEvents)
provide("mcTotalRecordsCount", totalRecordsCount)
provide("mcDataItemsCount", dataItemsCount)
provide("mcRecordTotal", recordTotal)
provide("mcStartPage", startPage)
provide("mcEndPage", endPage)
provide("mcLastPage", lastPage)
provide("mcTableTitle", tableTitle)
provide("mcSubItems", subItems)
provide("mcEndOfPage", endOfPage)
provide("mcPreviousPage", previousPage)
provide("mcNextPage", nextPage)
provide("mcCurrentPosition", currentPosition)
provide("mcSavedCurrentPage", savedCurrentPage)
provide("mcClearExplorerMessage", clearExplorerMessage)
provide("mcSetExplorerMessage", setExpMessage)
// mutable methods
provide("mcSetPreviousPage", setPreviousPage)
provide("mcSetNextPage", setNextPage)
provide("mcSetEndOfSubItemsPage", setEndOfSubItemsPage)
provide("mcSetStartPage", setStartPage)
provide("mcSetEndPage", setEndPage)
provide("mcSetLastPage", setLastPage)
provide("mcSetSavedCurrentPage", setSavedCurrentPage)
provide("mcSetPageLimit", setPageLimit)
provide("mcSetSearchKeyValue", setSearchKeyValue)
provide("mcSetCurrentPage", setCurrentPage)
provide("mcSetDataItemsValue", setDataItemsValue)
provide("mcSetDataItemValue", setDataItemValue)
provide("mcSetSearchItemsCount", setSearchItemsCount)
provide("mcSetExternalSearchKeyValue", setSearchKeyValue)
provide("mcSetExternalSearchItemsCount", setSearchItemsCount)

</script>

<style scoped>

</style>
