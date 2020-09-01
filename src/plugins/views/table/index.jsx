import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'



const headerContextMenu = [
  {
    label: "Hide Column",
    action: function(e, column) {
      column.hide()
    }
  },
]

const rowContextMenu = [
  {
    label: "Add Row...",
    action: function(e, row) {
      // leave this blank - useEffect will bind the clickNew fn into it
      // clickNew()
    }
  },
  {
    label: "Delete Row...",
    action: function(e, row) {
      //. delete from db - call a callback in app?
      row.delete()
    }
  },
]

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}


const headerSort = false // we handle it in app, not in tableview

function dataSorting(sorters) {
  //. remove last row
}
function dataSorted(sorters, rows) {
  //. re-add last row
}

function dataTreeStartExpanded(row, level) {
  // return true // nowork
  return false
}

function objectFormatter(cell, formatterParams, onRendered) {
  // cell - the cell component
  // formatterParams - parameters set for the column
  // onRendered - function to call when the formatter has been rendered
  // return "Mr" + cell.getValue(); //return the contents of the cell;
  const value = cell.getValue()
  // console.log(cell.getColumn().getField())
  // console.log(cell,value, typeof(value))
  if (typeof(value)==='object') {
    // return value ? value.name : ''
    return value.name
  }
  return value
}

function rowFormatter(row) {
  const data = row.getData()
  if (data.id===undefined || data.hasChildren) {
    row.getElement().style.fontWeight = 'bold'
  }
}

const tableOptions = {
  dataTree: true,
  dataTreeStartExpanded,
  dataSorting,
  dataSorted,
  rowFormatter,
  movableRows: true,
  rowContextMenu,
  cellContext: e => e.preventDefault(), // prevent browser's context menu
}



//. put coldefs into db eventually

// default props to override
const colDef = {
  width: 100, 
  headerSort, 
  editable: false,
  headerContextMenu,
  cellDblClick: (e, cell) => cell.edit(true),
}

const colDefs = {

  id: { 
    ...colDef,
    // visible: false,
  },

  name: { 
    ...colDef,
    width: 250, 
    editor: 'input', 
    formatter: objectFormatter,
  },

  notes: { 
    ...colDef,
    width: 250, 
    editor: 'input', 
  },
  
  //. singleselect
  project: { 
    ...colDef,
    width: 100, 
    editorParams: { 
      values: "neomem,tallieo,facemate,lockheed,ccs,PyVoyager".split(',').sort(),
    },
  },
  
  //. multiselect? single?
  type: { 
    ...colDef,
    width: 100, 
    editor: "select", 
    editorParams: { 
      values: "Author,Book,Person,Task,Project,Timeframe,Risk,Note,Datasource,View,Idea,Show,Movie".split(',').sort(), 
    },
  },
  
  //. singleselect - get values from db - how?
  timeframe: { 
    ...colDef,
    width: 100, 
    editor: "select", 
    editorParams: {
      values: "now,today,tonight,weekend,week,month,quarter,year,decade,life,nevermind,done".split(','),
    },
    formatter: objectFormatter,
  },
  
  //. singleselect
  client: { 
    ...colDef,
    width: 100, 
    editor: "select", 
    editorParams: { values: "me,MRIIOT".split(',').sort() },
  },
  
  //.
  author: { 
    ...colDef,
    width: 100, 
    editor: "select", 
    editorParams: {
      values: "tolkien,pkdick,tanithlee".split(','),
    }, 
    multiselect: true, 
  },

  related: { ...colDef, width: 100 },
  rels: { ...colDef, width: 200 },
  depth: { ...colDef, width: 100 },
  parentId: { ...colDef, width: 100 },
  order: { ...colDef, width: 100, editor: "input" },
  place: { ...colDef, width: 100 },
  relntype: { ...colDef, width: 100 },
  hasChildren: { ...colDef, width: 100 },

}

Object.keys(colDefs).forEach(key => {
  colDefs[key].field = key
  colDefs[key].title = key 
})


// avail table column types - cool - eg progress, star, tickCross
// const columns = [
//   { title: "Age", field: "age", hozAlign: "left", formatter: "progress" },
//   { title: "Favourite Color", field: "col" },
//   { title: "Date Of Birth", field: "dob", hozAlign: "center" },
//   { title: "Rating", field: "rating", hozAlign: "center", formatter: "star" },
//   { title: "Passed?", field: "passed", hozAlign: "center", formatter: "tickCross" }
// ]
// var data = [
//   {id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
//   {id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
//   {id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
//   {id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
//   {id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
// ]

const emptyRow = { id:-1 }


export default function TableView({ 
  visible, 
  rows, 
  groupBy, 
  facetObj, 
  datasource, 
  changeSort,
  clickNew,
}) {

  const [columns, setColumns] = React.useState([])
  const tableRef = React.useRef(null)


  React.useEffect(() => {
    // update context menu
    const menuItem = rowContextMenu.find(value => value.label === "Add Row...")
    if (menuItem) {
      menuItem.action = clickNew
    }
  }, [])


  // facet, rows, groupby changed
  React.useEffect(() => {

    const table = tableRef.current.table
    table.clearData()

    // get columns
    const cols = facetObj.cols || 'name'
    const colNames = cols.split(',')
    let columns = colNames.map(colName => colDefs[colName])
    columns = columns.filter(column => column.field !== groupBy) // remove the groupby column, if any
    columns.forEach(column=>column.headerClick = (e, column) => changeSort(column.getField()))
    setColumns(columns)

    if (groupBy) {

      const dict = {}
      for (const row of rows) {
        let group
        if (groupBy==='timeframe') {
          group = row.timeframe ? row.timeframe.name : ''
          row.timeframeOrder = row.timeframe ? row.timeframe.order : 100
        } else {
          group = row[groupBy]
        }
        if (!dict[group]) {
          dict[group] = []
        }
        dict[group].push(row)
      }
      
      const data = []
      const firstCol = columns[0].field // always put the group text in the first column
      for (const group of Object.keys(dict)) {
        const row = { [firstCol]:group, _children:dict[group] }
        data.push(row)
      }
      if (groupBy==='timeframe') {
        data.sort((a,b)=>a.timeframeOrder - b.timeframeOrder)
      } else {
        data.sort((a,b)=>a[firstCol].localeCompare(b[firstCol]))
      }
      table.addData(data)
    } else {
      table.addData(rows)
    }

  }, [facetObj, rows, groupBy])


  async function cellEdited(cell) {
    console.log(cell)
    const table = tableRef.current.table
    const col = cell.getColumn()
    const field = col.getField() // eg 'timeframe'
    const colDef = col.getDefinition()
    const row = cell.getRow()
    const data = row.getData()
    let id = data.id
    const value = cell.getValue() // eg 'week'
    const oldvalue = cell.getOldValue() // eg 'month'
    const editor = colDef.editor // eg 'input', 'select'

    const session = datasource.getSession()
    
    if (editor==='input') {
      // if (id===-1) {
      //   // const facetObj = facetObjs[facet]
      //   const queryTemplate = facetObj.addQuery
      //   const params = facetObj.params || {}
      //   console.log(queryTemplate)
      //   const query = substituteQueryParams(queryTemplate, params)
      //   console.log('run', query, params)
      //   const result = await session.run(query, params)
      //   console.log(result)
      //   const record = result.records[0]
      //   console.log(record)
      //   const row = record.get('n')
      //   console.log('row', row)
      //   table.updateData([{ id:-1,  [field]: undefined }])
      //   table.deleteRow(0) //?
      //   table.addRow(row)
      //   table.addRow(emptyRow)
      //   id = row.id
      // }
      const query = `
      MATCH (n) 
      WHERE id(n)=$id 
      SET n.${field}=$value
      `
      const params = { id, value }
      const result = await session.run(query, params)
      console.log(result)
      const row = { id, [field]: value }
      table.updateData([row])
    }

    else if (editor==='select' && field==='timeframe') {

      const params = { id, value, oldvalue }

      // drop any existing relation
      if (oldvalue) {
        const query = `
        MATCH (t)-[r:TIMEFRAME]->(u:Timeframe {name: $oldvalue})
        WHERE id(t)=$id 
        DELETE r
        `
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }

      // add new relation
      if (value) {
        const query = `
        MATCH (t), (u:Timeframe {name: $value}) 
        WHERE id(t)=$id 
        CREATE (t)-[:TIMEFRAME]->(u)
        `
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }
    }

    else if (editor==='select' && field==='type') {

      const params = { id, value, oldvalue }

      // drop existing label
      if (oldvalue) {
        let query = `
        MATCH (t)
        WHERE id(t)=$id 
        REMOVE t:#oldvalue#
        `
        query = substituteQueryParams(query, params)
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }

      // add new label
      if (value) {
        let query = `
        MATCH (t)
        WHERE id(t)=$id 
        SET t:#value#
        `
        query = substituteQueryParams(query, params)
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }

    }

    session.close()
  }

  return (
    <div className={"table-view" + (visible ? '' : ' hidden')}>
      <ReactTabulator
        ref={tableRef}
        data={[]}
        columns={columns}
        options={tableOptions}
        tooltips={false}
        layout={"fitData"}
        cellEdited={cellEdited}
      />
    </div>
  )
}
