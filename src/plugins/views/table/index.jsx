import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'
import colDefs from './colDefs'
import { getText } from '../../../packages/react-async-dialog'


function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}


function dataTreeStartExpanded(row, level) {
  // return true // nowork
  return false
}

// format row bold if group header or has children
function rowFormatter(row) {
  const data = row.getData()
  if (data.id===undefined || data.hasChildren) {
    row.getElement().style.fontWeight = 'bold'
  }
}


const newRow = { id:-1 }


export default function TableView({ 
  visible, 
  rows, 
  groupBy, 
  facetObj, 
  datasource, 
  changeSort,
  clickNew,
  currentId,
}) {

  const [columns, setColumns] = React.useState([])
  const tableRef = React.useRef(null)
  // const table = tableRef && tableRef.current && tableRef.current.table

  // define the rclick context menu for rows
  //. don't like having to parse this each time render is called - 
  // how get around that? memoize?
  const rowContextMenu = [
    {
      // label: "<i class='icon icon-edit'></i> Edit Notes...",
      label: "Edit Notes...",
      action: async function(e, row) {
        const data = row.getData()
        const ret = await getText("Edit Notes", "", data.notes)
        if (ret.ok) {
          // update db
          const query = `
          MATCH (n)
          WHERE id(n)=$id
          SET n.notes=$notes
          `
          const params = { id: data.id, notes: ret.value }
          const session = datasource.getSession()
          console.log(query, params)
          const result = await session.run(query, params)
          console.log(result)
          session.close()
          // update table
          const row = params
          const table = tableRef.current.table
          table.updateData([row])
        }
      }
    },
    {
      label: "Add Row...",
      action: function(e, row) {
        clickNew()
      }
    },
    {
      label: "Delete Row...",
      action: async function(e, row) {
        //. actually should move it to a trash bin folder
        // hmm
        if (window.confirm("Are you sure you want to delete this item?")) {
          const data = row.getData()
          const id = data.id
          // delete from db
          const query = `
          MATCH (n)
          WHERE id(n)=$id
          DETACH DELETE n
          RETURN count(n)
          `
          const params = { id }
          const session = datasource.getSession()
          const results = await session.run(query, params)
          console.log(results)
          console.log(results.records)
          const record = results.records && results.records[0]
          console.log(record)
          const count = record && record.get('count(n)')
          console.log(count)
          // delete from table
          if (count === 1) {
            row.delete()
          } else {
            alert("Error deleting item from db - please try again")
          }
        }
      }
    },
  ]

  const tableOptions = {
    dataTree: true, // allow grouping and hierarchies
    dataTreeStartExpanded,
    // dataLoaded,
    rowFormatter, // format rows as bold if group header
    selectable: 1, // only 1 row is selectable at a time
    movableRows: true, // drag and drop rows
    rowContextMenu, // right click on row context menu
    cellContext: e => e.preventDefault(), // prevent browser's rclick context menu
  }

  
  // function dataLoaded(data) {
  //   console.log(data) // always [] - why?
  //   // tableRef.current.table.scrollToRow(-1)
  // }
  
  
  // React.useEffect(() => {
  //   // update context menu
  //   //. alternatively, define the menu within this component...
  //   const menuItem = rowContextMenu.find(value => value.label === "Add Row...")
  //   if (menuItem) {
  //     menuItem.action = clickNew
  //   }
  // }, [])


  // facet, rows, groupby changed
  React.useEffect(() => {

    const table = tableRef.current.table
    table.clearData()

    // get columns
    const cols = facetObj.cols || 'name'
    const colNames = cols.split(',')
    let columns = colNames.map(colName => colDefs[colName])
    columns = columns.filter(column => column.field !== groupBy) // remove the groupby column, if any
    // click on column header tells parent app to resort items
    columns.forEach(column=>column.headerClick = (e, column) => changeSort(column.getField()))
    setColumns(columns)

    if (groupBy) {

      // group the rows by the groupBy field values
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

      // organize the data into rows with _children fields for child rows
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

  // currentId changed from parent app
  // eg when click New btn, add a newRow to the rows list,
  // and set currentId to newRow.id, which triggers this fn
  React.useEffect(() => {
    const table = tableRef.current.table
    table.scrollToRow(currentId)
    table.selectRow(currentId)
    // .then(() => {
    //   table.selectRow(currentId)
    //   //. start editing name cell?
    //   // table.selectCell
    //   // const row = table.getRow(currentId)  
    // })
  }, [currentId])


  // a cell was edited
  async function cellEdited(cell) {
    console.log(cell)
    console.log(facetObj) //. this gets stuck in the closure
    const table = tableRef.current.table
    const col = cell.getColumn()
    const field = col.getField() // eg 'project'
    const colDef = col.getDefinition()
    const row = cell.getRow()
    const data = row.getData()
    let id = data.id
    const value = cell.getValue() // eg ''
    const oldvalue = cell.getOldValue() // eg 'neomem'
    const editor = colDef.editor // eg 'input', 'select'

    const session = datasource.getSession()
    
    if (editor==='input') {

      if (id===newRow.id) {
        // const queryTemplate = facetObj.addQuery
        // const params = facetObj.params || {}
        // console.log(queryTemplate)
        // add a generic item and add link to inbox
        const queryTemplate = `
        MATCH (f:Folder {name:'inbox'})
        CREATE (n)<-[r:CHILD]-(f) 
        SET n.created=datetime(), n.modified=datetime()
        WITH n, id(n) as id
        RETURN n { .*, id }
        `
        const params = {}
        const query = substituteQueryParams(queryTemplate, params)
        console.log('run', query, params)
        const result = await session.run(query, params)
        console.log(result)
        const record = result.records[0]
        console.log(record)
        const row = record.get('n')
        console.log('row', row)
        // now delete the blank 'new' row
        table.updateData([{ id:newRow.id,  [field]: undefined }])
        table.deleteRow(newRow.id)
        // and add the new item
        table.addRow(row)
        // add another blank 'new' row
        // table.addRow(newRow)
        id = row.id
      }

      // update the string/number field value
      const query = `
      MATCH (n) 
      WHERE id(n)=$id 
      SET n.modified=datetime()
      SET n.${field}=$value
      `
      const params = { id, value }
      const result = await session.run(query, params)
      console.log(result)
      const row = { id, [field]: value }
      console.log(row)
      table.updateData([row])
    }

    // update field from timeframe dropdown value
    else if (editor==='select' && field==='timeframe') {

      // timeframes are objects, so get oldvalue from { name }
      const params = { id, value, oldvalue: oldvalue.name }
      console.log(params)

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
        SET t.modified=datetime()
        CREATE (t)-[:TIMEFRAME]->(u)
        `
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }
    }

    // update field from type dropdown value
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
        SET t.modified=datetime()
        `
        query = substituteQueryParams(query, params)
        console.log(query)
        const result = await session.run(query, params)
        console.log(result)
      }

    // update field from project dropdown value
    } else if (editor==='select' && field==='project') {

      // eg oldvalue='', value='neomem'
      //. multiselect? single select for now?
      //. what is relntype? it depends on the type of thing being linked to
      // eg if data.type==='View' then relntype is VIEW
      //. are there exceptions? 
      const RELNTYPE = data.type.toUpperCase() // eg 'View' to 'VIEW'
      const params = { id, value, oldvalue, RELNTYPE }
      console.log(params)
      // return

      // drop existing project relation
      if (oldvalue) {
        let query = `
        MATCH (n)<-[r]-(m:Project {name:"#oldvalue#"})
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
        SET n.modified=datetime()
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
