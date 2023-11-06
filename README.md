# @mconnect/mc-explorer | mConnect Data Explorer UI Component (vue-UI component)

- Smart, Simple & Versatile UI data explorer, built using vue3 composition API
- Explorer window with infinite data display and scrolling
- Include optional datatable paging of batch records, depends on @mconnect/mc-data-table UI package

- **Development & Documentation In progress**

## Installation
```npm
npm install @mconnect/mc-explorer

```

```ts
// include the data-table style in your application
import "@mconnect/mc-explorer/dist/stye.css"

```

## Components and Features

- *screen short*
- McExplore: entry point for defining the  data view/explorer options, structure and contents


## Usage Specifications

- You may import McExplorer, McExplorerDatatable & McExplorerNoData as components into your UI view/page

```ts
import {McExplorer, McExplorerDatatable, McExplorerNoData} from "@mconnect/mc-explorer";
import type {DataField, DataFetchAlertResult} from "@mconnect/mc-explorer"

```
- activate the McExplorer component in your UI template, and provide the required and/or optional props

```vue

<template>
  <McDataTable v-if="dataItems.length > 0" data-fields="" data-items="" data-stats="" data-fetch-alert=""/>

</template>

<script setup lang="ts">
  import {McExplorer, McExplorerDatatable, McExplorerNoData,} from "@mconnect/mc-explorer"
  import {ref} from "vue"
  // McDataTable props
  const dataItems = Array<ObjectType>([])

  // McExplorerDatatable props, in addition to McDataTable
  


  // McExplorerNoData props
  
  

</script>

```
- *usage example*

