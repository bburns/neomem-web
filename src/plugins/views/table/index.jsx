import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'



function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}


function headerClick(e, column) {
  console.log(e, column)
  // alert(column)
  const field = column.getField()
  alert(field)
  return false
}

// const headerSort = true
const headerSort = false

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



//. put coldefs into db eventually
const colDefs = {

  id: { 
    width: 50, 
    headerSort, 
    headerClick, 
    // visible: false,
  },

  name: { 
    width: 250, 
    headerSort, 
    headerClick, 
    editor: 'input', 
    formatter: objectFormatter,
  },

  notes: { 
    width: 250, 
    editor: 'input', 
    headerSort, 
    headerClick, 
  },
  
  //. singleselect
  project: { 
    width: 100, 
    editorParams: { 
      values: "neomem,tallieo,facemate,lockheed,ccs,PyVoyager".split(',').sort(),
    },
    headerSort, 
    headerClick, 
  },
  
  //. multiselect? single?
  type: { 
    width: 100, 
    editor: "select", 
    editorParams: { 
      values: "Author,Book,Person,Task,Project,Timeframe,Risk,Note,Datasource,View".split(',').sort(), 
    },
    headerSort, 
    headerClick, 
  },
  
  //. singleselect - get values from db - how?
  timeframe: { 
    width: 100, 
    editor: "select", 
    editorParams: {
      values: "now,today,weekend,week,month,quarter,year,decade,life,done".split(','),
    },
    headerSort, 
    headerClick, 
    formatter: objectFormatter,
  },
  
  //. singleselect
  client: { 
    width: 100, 
    editor: "select", 
    editorParams: { values: "me,MRIIOT".split(',').sort() },
    headerSort, 
    headerClick, 
  },
  
  //.
  author: { 
    width: 100, 
    editor: "select", 
    editorParams: {
      values: "tolkien,pkdick,tanithlee".split(','),
    }, 
    multiselect: true, 
    headerSort, 
    headerClick, 
  },

  related: { width: 100, headerSort, headerClick },
  rels: { width: 200, headerSort, headerClick },
  depth: { width: 100, headerSort, headerClick },
  parentId: { width: 100, headerSort, headerClick },
  order: { width: 100, editor: "input", headerSort, headerClick },
  place: { width: 100, headerSort, headerClick },
  relntype: { width: 100, headerSort, headerClick },
  hasChildren: { width: 100, headerSort, headerClick },

}

Object.keys(colDefs).forEach(key => {
  colDefs[key].field = key
  colDefs[key].title = key 
})


// avail table column types - cool
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
}) {

  const [columns, setColumns] = React.useState([])
  const tableRef = React.useRef(null)

  // facet, rows, groupby changed
  React.useEffect(() => {

    const table = tableRef.current.table
    table.clearData()

    // get columns
    const cols = facetObj.cols || 'name'
    const colNames = cols.split(',')
    let columns = colNames.map(colName => colDefs[colName])
    columns = columns.filter(column => column.field !== groupBy) // remove the groupby column, if any
    columns.forEach(column=>column.headerClick = (e,column) => changeSort(column.getField()))
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


  // React.useEffect(() => {
  //   const cols = facetObj.cols || 'name'
  //   const colNames = cols.split(',')
  //   let columns = colNames.map(colName => colDefs[colName])
  //   console.log(columns)
  //   columns = columns.filter(column => column.field !== groupBy)
  //   columns.forEach(column=>column.headerClick = (e,column) => changeSort(column.getField()))
  //   setColumns(columns)
  // }, [facetObj, groupBy])


  function rowFormatter(row) {
    const data = row.getData()
    if (data.id===undefined) {
      row.getElement().style.fontWeight = 'bold'
    }
  }

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
    console.log(col)
    console.log(field)
    console.log(colDef)
    console.log(row)
    console.log(data)
    console.log(id)
    console.log(value)
    console.log(editor)

    const session = datasource.getSession()
    
    if (editor==='input') {
      if (id===-1) {
        // const facetObj = facetObjs[facet]
        const queryTemplate = facetObj.addQuery
        const params = facetObj.params || {}
        console.log(queryTemplate)
        const query = substituteQueryParams(queryTemplate, params)
        console.log('run', query, params)
        const result = await session.run(query, params)
        console.log(result)
        const record = result.records[0]
        console.log(record)
        const row = record.get('n')
        console.log('row', row)
        table.updateData([{ id:-1,  [field]: undefined }])
        table.deleteRow(0) //?
        table.addRow(row)
        table.addRow(emptyRow)
        id = row.id
      }
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

      // drop any existing relation
      const query1 = `
      MATCH (t)-[r]-(u:Timeframe {name: $oldvalue})
      WHERE id(t)=$id 
      DELETE r
      `
      const params = { id, value, oldvalue }
      const result1 = await session.run(query1, params)
      console.log(result1)

      // add new relation
      const query2 = `
      MATCH (t), (u:Timeframe {name: $value}) 
      WHERE id(t)=$id 
      CREATE (t)-[:TIMEFRAME]->(u)
      `
      const result2 = await session.run(query2, params)
      console.log(result2)
    }

    else if (editor==='select' && field==='type') {

      // drop existing label
      let query1 = `
      MATCH (t)
      WHERE id(t)=$id 
      REMOVE t:#oldvalue#
      `
      const params = { id, value, oldvalue }
      query1 = substituteQueryParams(query1, params)
      const result1 = await session.run(query1, params)
      console.log(result1)

      // add new label
      let query2 = `
      MATCH (t)
      WHERE id(t)=$id 
      SET t:#value#
      `
      query2 = substituteQueryParams(query2, params)
      const result2 = await session.run(query2, params)
      console.log(result2)

    }

    session.close()
  }

  return (
    <div className={"table-view" + (visible ? '' : ' hidden')}>
      <ReactTabulator
        ref={tableRef}
        data={[]}
        columns={columns}
        options={{
          groupBy, 
          dataTree: true, 
          dataTreeStartExpanded,
          movableRows: true,
          dataSorting, 
          dataSorted, 
          rowFormatter, 
        }}
        tooltips={false}
        layout={"fitData"}
        cellEdited={cellEdited}
      />
    </div>
  )
}
