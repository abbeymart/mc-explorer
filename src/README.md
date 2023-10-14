# mConnect Explorer Component

- Smart UI explorer, built using vue3 composition API

- **Development & Documentation In progress**

## Installation
```npm
npm install @mconnect/mc-data-table

```

```ts
// import (include) the mc-data-table stylesheet in your application
import "@mconnect/mc-data-table/dist/style.css"

```

## Components and Features

- *screen short*
- McExplorer: entry point for defining the explorer window structure and contents, for infinite records scrolling by batches/pageLimit
- McExplorerDatatable: entry point for defining the explorer window structure and contents, using McDataTable
- McExplorerTable: The explorer window structure - columns, contents, headers and footers
- McExplorer window should include two primary columns tree-structure - main/contents
- McExplorer window content section should include in-place item/sub-items CRUD(create, read, update & delete) tasks
- McExplorerMessage: indicate the explorer content information - records/items count... 
- McExplorerNoData: a component to display when there are no contents/records to display
- McExplorerSearch: to filter explorer window contents/records, by search keyword(s)
- McExplorerPageLimit: select the records per page


## Usage Specifications

- You may import McDataTable, McExplorerDataTable & McTableNoData as components into your UI view/page

```ts
import {McDataTable, McTableNoData} from "@mconnect/mc-data-table";
import type {DataField, DataFetchAlertResult} from "@mconnect/mc-data-table"

```
- activate the mcDatatable component in your UI template, and provide the required and/or optional props

```vue

<template>
  <McDataTable v-if="dataItems.length > 0" data-fields="" data-items="" data-stats="" data-fetch-alert=""/>

</template>

<script setup lang="ts">
  import {McDataTable, McTableNoData} from "@mconnect/mc-data-table";
  import type {DataField, DataFetchAlertResult, ObjectType} from "@mconnect/mc-data-table"
  
  import {ref} from "vue"
  // McDataTable props
  const dataItems = Array<ObjectType>([])

  // McExplorerDataTable props, in addition to McDataTable
  


  // McTableNoData props
  
  

</script>

```

- import McExplorer component as a component into your UI view/page or as an app-plugin
- activate the McExplorer component in your UI template, and provide the required and/or optional props
- *usage example*
- Required and optional specifications
- McDataTable: *props* (required and optional)
- Required props: dataFields (Array<object>) and dataItems (Array<object>)
- Optional props: dataTotal, paging, pageStart, pageLimits (Array<number>), tableStyle, sortStyle
- *dataFields*: => dataSpecs.ts
- *dataItems*: => provider data records
  props     : {
  dataFields: {
  type    : Array,
  required: true,
  },
  dataItems : {
  type    : Array,
  required: true
  },
  dataTotal : {
  type   : Number,
  default: 0,
  },
  paging    : {
  type   : Boolean,
  default: true,
  },
  pageStart : {
  type   : Number,
  default: 1,
  },
  pageLimits: {
  type   : Array,
  default: () => [10, 20, 30, 50, 100, 200],
  },
  tableStyle: {
  type   : Object,
  default: () => {
  return {
  table      : "w3-table w3-striped w3-border w3-bordered w3-hoverable",
  tableHeader: "w3-red",
  tableBody  : "w3-hover",
  }
  },
  },
  sortStyle : {
  type   : Object,
  default: () => {
  return {
  asc : "fa fa-caret-up",
  desc: "fa fa-caret-down",
  }
  },
  },
  },
