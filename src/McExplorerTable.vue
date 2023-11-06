<template>
  <div>
    <div v-if="tableFields.length > 0 && tableRecords.length > 0">
      <table id="mc-table-content" :class="tableStyle.table">
        <thead id="mc-table-header" :class="tableStyle.tableHeader">
        <tr>
          <th v-for="field in tableFields" :key="field.name" class="mc-tool-cursor"
              scope="col" @click.prevent="sortDataByField(field)">
            <span class="w3-left-align">{{ field.label }} </span>
            <span v-if="field.sort" class="material-icons mc-table-inline-icon">{{ sortStyleName }}</span>
          </th>
        </tr>
        </thead>
        <tbody id="mc-table-body" :class="tableStyle.tableBody">
        <tr v-for="item in tableRecords" :key="item['id']">
          <td v-for="fieldItem in item.fieldsInfo" :key="fieldItem.fieldName + item['id']" class="mc-tooltip">
            <span v-if="!permitSaveDeleteTask(item['id'])" class="mc-tooltiptext">{{ permitSaveDeleteMessage }}</span>
            <input
                v-if="fieldItem.fieldSourceType === 'checkbox'"
                :disabled="!permitSaveDeleteTask(item['id'])"
                v-model="itemsIds"
                :value="item['id']"
                class="w3-check"
                type="checkbox"
                @change="fieldItem.fieldTask && fieldItem.fieldTask(itemsIds)"
            />
            <span
                v-else-if="fieldItem.fieldSourceType === 'provider' && !fieldItem.fieldSource.domComp ">{{
                item[fieldItem.fieldName]
              }}</span>
            <ExplorerCustom
                v-else-if="fieldItem.fieldSourceType.startsWith('custom') && fieldItem.fieldTask"
                :item-data="item.itemRecord" :item-label="fieldItem.fieldLabel" :item-task="fieldItem.fieldTask"
            :item-type="fieldItem.fieldSourceType"/>
            <ExplorerUpdate
                v-else-if="fieldItem.fieldSourceType === 'taskLink' && fieldItem.fieldTask && (fieldItem.fieldName === 'update')"
                :item-data="item.itemRecord" :item-label="fieldItem.fieldLabel" :item-task="(fieldItem.fieldTask)"/>
            <ExplorerDelete
                v-else-if="fieldItem.fieldSourceType === 'taskLink' && fieldItem.fieldTask && fieldItem.fieldName === 'delete'"
                :item-id="item['id']" :item-label="fieldItem.fieldLabel" :item-task="(fieldItem.fieldTask)"/>
            <span v-else-if="fieldItem.fieldSource.domComp" v-html="fieldItem.fieldValue"/>
            <span v-else>
              <span v-for="ev in [...fieldItem.fieldEvents]" :key="ev.type">
                <span v-if="ev.type === 'click'" @click.prevent="eventHandler(item, ev)">
                  {{ fieldItem.fieldValue }}
                </span>
                <span v-else-if="ev.type === 'mouseenter'" @mouseenter.prevent="eventHandler(item, ev)">
                  {{ fieldItem.fieldValue }}
                </span>
                <span v-else-if="ev.type === 'mouseover'" @mouseover.prevent="eventHandler(item, ev)">
                  {{ fieldItem.fieldValue }}
                </span>
                <span v-else-if="ev.type === 'mouseleave'" @mouseleave.prevent="eventHandler(item, ev)">
                  {{ fieldItem.fieldValue }}
                </span>
              </span>
            </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <ExplorerNoData :items-count="tableRecords.length"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExplorerNoData from "./McExplorerNoData.vue";
import ExplorerUpdate from "./templates/ExplorerUpdate.vue";
import ExplorerDelete from "./templates/ExplorerDelete.vue";
import ExplorerCustom from "./templates/ExplorerCustom.vue";
import { sortBy } from "lodash"; // TODO: extract/use sortBy as standalone function?
import { computed, inject, ref, unref, watch } from "vue";
import type {
  DataField, EventType, FieldItemInfo, ItemData, ItemTaskType, ObjectType, PermitSaveDelete,
  PermittedEvents, SetBoolType, SetDataItems, SetDataItemsTotal, SetNumberType, SortStyle, TableStyle,
  MainDataField, TaskUpdate
} from "./types";
import { useExplorer } from "./useExplorer";

const permitSaveDeleteMessage = inject("mcPermitSaveDeleteMessage", "Update and Delete tasks are not permitted")
const {defaultTableStyle, defaultSortStyle,} = useExplorer()
const sortAsc = ref<boolean>(true)
const sortDesc = ref<boolean>(false)
const itemsIds = ref<Array<string>>([])
const permitSaveDelete = inject<PermitSaveDelete>("mcPermitSaveDelete")
const dataItems = inject<Array<ObjectType>>("mcDataItems", [])
const dataItem = inject<ObjectType>("mcDataItem", {})
const dataFields = inject<Array<DataField>>("mcDataFields", [])
const pageLimit = inject<number>("mcPageLimit", 10)
const currentPage = inject<number>("mcCurrentPage", 1)
const tableStyle = inject<TableStyle>("mcTableStyle", defaultTableStyle)
const sortStyle = inject<SortStyle>("mcSortStyle", defaultSortStyle)
const searchKey = inject<string>("mcSearchKey", "")
const startPage = inject<number>("mcStartPage", 1)
const endPage = inject<number>("mcEndPage", 1)
const setPreviousPage = inject<SetNumberType>("mcSetPreviousPage")
const setNextPage = inject<SetNumberType>("mcSetNextPage")
const setDataItemsValue = inject<SetDataItems>("mcSetDataItemsValue")
const setSearchItemsCount = inject<SetDataItemsTotal>("mcSetSearchItemsCount")
const setEndOfItemsPage = inject<SetBoolType>("mcSetEndOfSubItemsPage")
const permittedEvents = inject<Array<PermittedEvents>>("mcPermittedEvents", ["click", "mouseover", "mouseleave",
  "mouseenter"])
const parentDataField = inject<MainDataField>("mcParentField", {name: "parentId"})

const sortDataByField = (field: DataField) => {
  // toggle sort order, for dataItems.value
  if (field.sort) {
    if (sortAsc.value) {
      // sort in descending order
      const dItems = sortBy(unref(dataItems), [field.name]).reverse();
      setDataItemsValue && setDataItemsValue(dItems)
      // setDataItemsValue(dItems)
      sortAsc.value = false;
      sortDesc.value = true;
    } else {
      // sort in ascending order
      const dItems = sortBy(unref(dataItems), [field.name]);
      setDataItemsValue && setDataItemsValue(dItems)
      // setDataItemsValue(dItems)
      sortAsc.value = true;
      sortDesc.value = false;
    }
  }
}

const permitSaveDeleteFunc = unref(permitSaveDelete)

const updateTask = ref<TaskUpdate>()

const permitSaveDeleteTask = (itemId: string): boolean => {
  return permitSaveDeleteFunc ? permitSaveDeleteFunc(itemId) : true
}

const parentFieldName = computed(() => {
  return unref(parentDataField).name
})

const tableFields = computed<Array<DataField>>(() => sortBy(unref(dataFields), ["order"]))

const computedDataItems = computed<Array<ObjectType>>(() => {
  // transform data-items to subItems, for complete table-items search, by itemId (as subItems parentId)
  return unref(dataItem).id? unref(dataItems).map(item => {
    // clone the item for computation && original item/record
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
  }).filter(it => !!it.itemRecord[parentFieldName.value] && it.itemRecord[parentFieldName.value] === unref(dataItem).id ) : [];
})

const sortStyleName = computed(() => sortAsc.value ? `${unref(sortStyle).asc}` : `${unref(sortStyle).desc}`)

const searchedDataItems = computed(() => {
  // search data-items by search-key: from tableFields => Proxy[Proxy...] array-of-proxy-objects
  const dataItemKeys = tableFields.value.map(item => item.name);
  // filter the dataItems.value, by the data-item-keys
  return computedDataItems.value.filter(item => dataItemKeys.some(key => {
        if (item[key]) {
          return item[key].toString().toLowerCase().includes(unref(searchKey).toLowerCase())
        }
        return false;
      }
  ));
})

const totalPages = computed(() => {
  return Math.ceil(searchedDataItems.value.length / unref(pageLimit))
})

// compute items/records by scroll-screen-page-limit, to support items-view by screen scrolling limit
const tableItems = computed<Array<ObjectType>>(() => {
  let tableData: Array<ObjectType> = [];
  const dataSize = searchedDataItems.value.length;  // data-size is the current data-searchItems-count
  // update dataItemsCount/searchItemsCount store-value
  setSearchItemsCount && setSearchItemsCount(dataSize)
  // for searchedItems-count <= pageLimit OR totalPages = 1, display all item-records
  const pLimit = unref(pageLimit)
  if (dataSize <= pLimit || totalPages.value <= 1) {
    tableData = searchedDataItems.value
  } else {
    // compute item-records, for dataSize > pLimit || totalPages > 1:
    let cPage = unref(currentPage)    // current-page
    // adjust currentPage(cPage), considering startPage, endPage & dataSize <= dataTotal
    const sPage = unref(startPage)    // start-page of the current data-items
    const ePage = unref(endPage)      // end-page of the current data-items
    // constrain currentPage
    if (cPage < sPage) {
      cPage = sPage
    }
    if (cPage > ePage) {
      cPage = ePage
    }
    // if currentPage < totalPages, get item-records by currentPage & pageLimit
    const remainingItemsCount = dataSize - (cPage - 1) * pLimit
    if (cPage < totalPages.value) {
      if (remainingItemsCount <= pLimit) {
        // set end of searched-records
        setEndOfItemsPage && setEndOfItemsPage(true)
        // set/compute previous and next pages
        setPreviousPage && cPage > 1 && setPreviousPage(cPage - 1)
        setNextPage && setNextPage(cPage + 1)
        // fetch/return up to the end of the remaining records
        tableData = searchedDataItems.value.slice((cPage-1)*pLimit, dataSize - 1)
      } else {
        // fetch/return the next records batch, by pageLimit
        tableData = searchedDataItems.value.slice((cPage-1)*pLimit, cPage * pLimit)
      }
    }
  }
  return tableData;
})

// compute table-records for the sub-items, from tableItems
const tableRecords = computed<Array<ItemData>>(() => {
  try {
    // transform table-items, by data-fields
    return tableItems.value.map(item => {
      // clone the item/record for transformation
      let fieldsInfo: Array<FieldItemInfo> = [];
      const itemData: ItemData = Object.assign({}, item, {fieldsInfo}, {itemRecord: item.itemRecord});
      // sort by table-field order
      tableFields.value.forEach((field) => {
        // compose the table field/column
        // column/field value
        const fieldSource = field.source,
            fieldName = field.name,
            fieldType = field.type,
            fieldSourceType = field.source.type,
            fieldLabel = field.label;
        let fieldTask: ItemTaskType,
            fieldParams: ObjectType = {},
            fieldValue: any;

        if (fieldSourceType === "provider") {
          // field-value already transformed from dataItems.value computed values
          fieldValue = item[fieldName];
        } else {
          if (field.source.task) {
            fieldTask = field.source.task;
          }
          fieldParams = field.source.params as ObjectType;
        }
        fieldsInfo.push(
            {
              fieldValue     : fieldValue,
              fieldSource    : fieldSource,
              fieldType      : fieldType,
              fieldSourceType: fieldSourceType,
              fieldName      : fieldName,
              fieldTask      : fieldTask!,
              fieldParams    : fieldParams,
              fieldLabel     : fieldLabel,
              fieldEvents    : field.events ? field.events : [],
            }
        )
      });
      itemData.fieldsInfo = fieldsInfo;
      return itemData;
    });
  } catch (e) {
    console.error(e)
    console.log("error rendering table: ", e.message);
    return [];
  }
})

watch([dataItem], ([val]) => {
  if (val["id"]) {
    const itemInfo = tableFields.value.find(it => it["name"] === "update")
    updateTask.value = itemInfo?.source.task
  }
}, {immediate: true})

// eventHandler method: handles permitted events handler for item/record-fields
const eventHandler = (item: ObjectType, ev: EventType) => {
  // check permitted events
  if (unref(permittedEvents).includes(ev.type)) {
    // params
    if (ev.params && ev.params.length > 0) {
      // params-value-parsing by type
      let itemParams: any = {}
      for (const key of Object.keys(ev.params)) {
        itemParams[key] = item[key]
      }
      if (ev.task) {
        ev.task(itemParams);
      }
    }
  }
}

</script>

<style scoped>
.mc-table-inline-icon {
  vertical-align: -6px;
  font-weight: bolder;
  background-color: #0D47A1;
}
</style>
