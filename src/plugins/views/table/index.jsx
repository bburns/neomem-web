import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'
import './tabulator.css'
// import colDefs from './colDefs'
import { getText } from '../../../packages/react-async-dialog'



function dataTreeStartExpanded(row, level) {
  // return true //. nowork - why?
  return false
}

// format row bold if group header or has children
function rowFormatter(row) {
  const data = row.getData()
  if (data.id===undefined || data.hasChildren) {
    row.getElement().style.fontWeight = 'bold'
  }
}


//. what if wanted lots of blank rows by default, eg at bottom of table?
const newRow = { id:-1 }


export default function TableView({ 
  visible, 
  rows, 
  groupBy, 
  // facetObj, 
  colDefs,
  cols,
  datasource, 
  changeSort,
  clickNew,
  currentId,
}) {

  const [columns, setColumns] = React.useState([])
  const tableRef = React.useRef(null)

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
          if (datasource.setPropertyValue(data.id, 'notes', ret.value)) {
            // update table
            const table = tableRef.current.table
            const row = { id: data.id, notes: ret.value }
            table.updateData([row])
          }
          //. should we handle all errors like this? 
          //. what if pass a ui object to the datasource fns,
          // and it could show an error message that way?
          // ie it could call ui.show(error) or sthing, and diff ui's could
          // interpret it as they needed.
          //  else {
          //   alert("Error updating notes")
          // }
        }
      }
    },
    {
      label: "Add Item...",
      action: function(e, row) {
        //. insert item at current location
        clickNew()
      }
    },
    {
      label: "Delete Item...",
      action: async function(e, row) {
        //. actually should move it to a trash bin folder
        // hmm
        if (window.confirm("Are you sure you want to delete this item?")) {
          const data = row.getData()
          if (datasource.deleteItem(data.id)) {
            row.delete()
          }
          //  else {
          //   alert("Error deleting item from db - please try again")
          // }
        }
      }
    },
  ]

  function dataTreeRowExpanded(row, level) {
    // alert('pok')
  }

  const tableOptions = {
    dataTree: true, // allow grouping and hierarchies
    dataTreeStartExpanded,
    rowFormatter, // format rows as bold if group header
    selectable: 1, // only 1 row is selectable at a time
    movableRows: true, // drag and drop rows
    rowContextMenu, // right click on row context menu
    cellContext: e => e.preventDefault(), // prevent browser's rclick context menu
    dataTreeRowExpanded,
  }

  
  // facet, rows, groupby changed
  React.useEffect(() => {

    const table = tableRef.current.table
    table.clearData()

    // get columns
    // const cols = facetObj.cols || 'name' //.
    // const cols = 'name'
    // const colNames = cols.split(',')
    const colNames = cols
    let columns = colNames.map(colName => colDefs[colName])
    columns = columns.filter(column => column.field !== groupBy) // remove the groupby column, if any
    // click on column header tells parent app to resort items
    //. and save it in the focused item's _views settings object
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

  // }, [facetObj, rows, groupBy])
  }, [rows, groupBy])

  // currentId changed from parent app
  // eg when click New btn, add a newRow to the rows list,
  // and set currentId to newRow.id, which triggers this fn
  React.useEffect(() => {
    const table = tableRef.current.table
    table.scrollToRow(currentId)
    table.selectRow(currentId)
    //. ?
    // .then(() => {
    //   table.selectRow(currentId)
    //   //. start editing name cell?
    //   // table.selectCell
    //   // const row = table.getRow(currentId)  
    // })
  }, [currentId])


  // a cell was edited
  async function cellEdited(cell) {
    // console.log(facetObj) //. this gets stuck in the closure
    const table = tableRef.current.table
    const col = cell.getColumn()
    const field = col.getField() // eg 'project'
    const colDef = col.getDefinition()
    const row = cell.getRow()
    const data = row.getData()
    console.log(data)
    let id = data.id
    const value = cell.getValue() // eg ''
    const oldvalue = cell.getOldValue() // eg 'neomem'
    const editor = colDef.editor // eg 'input', 'select'

    // create new item if edited the blank 'new' row
    if (id===newRow.id) {
      const row = await datasource.addItem()
      //. make link to inbox a separate call to setRelation
      // MATCH (f:Folder {name:'inbox'})
      // CREATE (n)<-[r:CHILD]-(f)
      // await datasource.setRelation(row.id, 'childOf', 'Folder:inbox')
      if (row) {
        id = row.id
        // delete the blank 'new' row
        table.updateData([{ id:newRow.id, [field]: undefined }])
        table.deleteRow(newRow.id)
        // add the new item
        table.addRow(row)
        // optionally add another blank 'new' row
        // table.addRow(newRow)
      }
    }

    // update string value
    if (editor==='input') {
      if (await datasource.setPropertyValue(id, field, value)) {
        const row = { id, [field]: value }
        table.updateData([row])
      }
    }

    // update type
    else if (editor==='select' && field==='type') {
      if (await datasource.setType(id, value, oldvalue)) {
        const row = { id, [field]: value }
        table.updateData([row])
      }
    }

    // update timeframe
    else if (editor==='select' && field==='timeframe') {
      // timeframes are objects, so get oldvalue from { name }
      await datasource.setRelation(id, field, value, oldvalue.name)
    }

    // update project
    else if (editor==='select' && field==='project') {
      // eg data.type is eg 'View' - want to use 'VIEW' for the relntype
      const destType = data.type
      if (!await datasource.setRelation2(id, field, value, oldvalue, destType)) {
        alert("Error writing to database")
      }
    }

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
