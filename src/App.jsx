import React from 'react'
import { ReactTabulator } from 'react-tabulator'
// import 'react-tabulator/lib/styles.css'
import 'react-tabulator/css/tabulator.css'
import './App.css'
import logo from './assets/logo256.png'
import neo4j from 'neo4j-driver'


// get neo4j driver
const uri = process.env.REACT_APP_NEO4J_URI
const user = process.env.REACT_APP_NEO4J_USER
const password = process.env.REACT_APP_NEO4J_PASSWORD
// note: neo4j stores 64-bit ints, js only goes up to 53-bits (9e16)
// see https://github.com/neo4j/neo4j-javascript-driver#enabling-native-numbers
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), { disableLosslessIntegers: true })


// ;(async function() {
//   const session = driver.session()
//   const query = "call db.labels()"
//   const results = await session.run(query)
//   console.log(results)
//   const foo = results.records.map(record => record.get('label')).sort()
//   console.log(foo)
//   session.close()
// })()

async function getTypes() {
  const session = driver.session()
  const query = "call db.labels()"
  const results = await session.run(query)
  session.close()
  const types = results.records.map(record => record.get('label')).sort()
  return types
}


//. put these into db also eventually

const projectQuery = `
MATCH (n)-[r:PROJECT]->(m:Project {name:$projectName}) 
OPTIONAL MATCH (n)-[:TIMEFRAME]->(t:Timeframe)
WITH n, labels(n) as type, collect(t.name) as timeframe, collect(m.name) as project, id(n) as id
RETURN n { .*, type, timeframe, project, id }
`
const projectCols = "id,project,type,name,timeframe,description"
const projectAddQuery = `
MATCH (m:Project {name:$projectName})
CREATE (n:Task)-[:PROJECT]->(m)
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`
const genericQuery = `
MATCH (n:#label#) 
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`
const genericCols = "id,type,name,description"
const genericAddQuery = `
CREATE (n:#label#)
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`

const facetObjs = {
  facets: {
    params: { label: 'Facet' },
    query: genericQuery,
    cols: genericCols,
    addQuery: genericAddQuery,
  },
  projects: {
    params: { label: 'Project' },
    query: genericQuery,
    cols: genericCols,
    addQuery: genericAddQuery,
  },
  personal: { params: { projectName: 'personal' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  neomem: { params: { projectName: 'neomem' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  tallieo: { params: { projectName: 'tallieo' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  facemate: { params: { projectName: 'facemate' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  ccs: { params: { projectName: 'ccs' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  people: {
    params: { label: 'Person' },
    query: genericQuery,
    cols: genericCols,
    addQuery: genericAddQuery,
  },
  books: {
    query: `
    MATCH (n) 
    WHERE (n:Book) or (n:Author) 
    OPTIONAL MATCH (n)-[r:AUTHOR]->(m) 
    WITH n, collect(m.name) as author, labels(n) as type, id(n) as id
    RETURN n { .*, type, author, id }`,
    cols: "id,type,author,name,description",
  },
  timeframe: {
    //. include items without a project also
    query: `
    MATCH (n)-[r:PROJECT]->(m), (n)-[:TIMEFRAME]->(t) 
    WITH n, labels(n) AS type, collect(m.name) AS project , collect(t.name) AS timeframe, id(n) as id
    RETURN n {.*, type, project, timeframe, id }`,
    cols: "id,type,project,name,timeframe,description",
  },
}

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}



//. put coldefs into db eventually
const colDefs = {
  id: { width: 50 },
  name: { width: 250, editor: 'input' },
  description: { width: 350, editor: 'input' },
  
  //. singleselect
  project: { width: 100, editorParams: { 
    values: "neomem,tallieo,facemate,lockheed,ccs,PyVoyager,".split(',').sort(),
  } },
  
  //. multiselect? single?
  type: { width: 100, editor: "select", editorParams: { 
    values: "Author,Book,Person,Task,Project,Timeframe,Risk,Note".split(',').sort(),
  }},
  
  //. singleselect - get values from db - how?
  timeframe: { width: 100, editor: "select", editorParams: {
    values: "year,quarter,month,week,today,now,done".split(','),
  }},
  
  //.
  author: { width: 100, editor: "select", editorParams: {
    values: "tolkien,pkdick,tanithlee".split(','),
  }, multiselect: true },

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

const emptyRow = { id:0 }

function App() {

  const [facet, setFacet] = React.useState("projects")
  const [query, setQuery] = React.useState("") // used to display query to user
  const [rows, setRows] = React.useState([])
  const [columns, setColumns] = React.useState([])
  const tableRef = React.useRef(null)
  const facetRef = React.useRef(facet)

  React.useEffect(() => {
    facetRef.current = facet
    ;(async () => {
      const facetObj = facetObjs[facet]
      // setFacetObj(facetObj)
      let { query, params={}, cols } = facetObj
      query = substituteQueryParams(query, params)
      setQuery(query)
      const colNames = cols.split(',')
      const columns = colNames.map(colName => colDefs[colName])
      setColumns(columns)
      if (!query) return
      console.log(query, params)
      const rows = []
      const session = driver.session({ defaultAccessMode: neo4j.session.READ })
      const result = await session.run(query, params || {})
      result.records.forEach(record => {
        const row = record.get('n')
        Object.keys(row).forEach(key => {
          if (Array.isArray(row[key])) {
            row[key] = row[key].join(', ')
          }
        })
        rows.push(row)
      })
      rows.push(emptyRow)
      session.close()
      setRows(rows)
    })()
  }, [facet])

  function changeFacet(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  async function cellEdited(cell) {
    console.log(cell)
    const facet = facetRef.current
    console.log(facet)

    console.log(tableRef.current)
    console.log(tableRef.current.table)
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
    const session = driver.session()
    if (editor==='input') {
      if (!id) {
        const facetObj = facetObjs[facet]
        let query = facetObj.addQuery
        const params = facetObj.params || {}
        console.log(query)
        query = substituteQueryParams(query, params)
        console.log('run', query, params)
        const result = await session.run(query, params)
        console.log(result)
        const record = result.records[0]
        console.log(record)
        const row = record.get('n')
        console.log('row', row)
        table.updateData([{ id:0,  [field]: undefined }])
        table.deleteRow(0)
        table.addRow(row)
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
      table.addRow(emptyRow)
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

  console.log(facet)

  return (
    <div className="app">
      
      <div className="app-header">
        
        <div className="app-header-logo">
          <img src={logo} alt="logo" /> 
          <span>Neomem</span>
        </div>

        <div className="app-header-facet">
          <span>Facet:&nbsp;</span>
          <select name="facet" id="facet" value={facet} onChange={changeFacet}>
            {Object.keys(facetObjs).map(facet => <option key={facet} value={facet}>{facet}</option>)}
          </select>
        </div>
        <div className="app-header-query">Query: {query}</div>
      </div>
      
      <div className="app-contents">
        <ReactTabulator
          ref={tableRef}
          data={rows}
          columns={columns}
          tooltips={false}
          layout={"fitData"}
          cellEdited={cellEdited}
          // dataEdited={newData => console.log('dataEdited', newData)}
          // footerElement={<span>Footer</span>}
        />
      </div>
    </div>
  )
}

export default App
