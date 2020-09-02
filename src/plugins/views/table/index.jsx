import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'
import colDefs from './coldefs'


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


  // a cell was edited
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

    } else if (editor==='select' && field==='project') {

      // eg oldvalue='', value='neomem'
      //. multiselect? single select for now?
      const params = { id, value, oldvalue, RELNTYPE: 'TIP' }

      // drop any existing project
      if (oldvalue) {
        let query = `
        MATCH (n)<-[r]-(m:Project {name:#oldvalue#})
        WHERE id(n)=$id 
        DELETE r
        `
        query = substituteQueryParams(query, params)
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }

      // add link to new project
      if (value) {
        let query = `
        MATCH (n), (m:Project {name:"#value#"})
        WHERE id(n)=$id
        CREATE (n)<-[r:#RELNTYPE#]-(m)
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
        layout="fitData"
        cellEdited={cellEdited}
      />
    </div>
  )
}
