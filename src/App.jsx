import React from 'react'
import './App.css'
import { ReactTabulator } from 'react-tabulator'
// import 'react-tabulator/lib/styles.css'
import 'react-tabulator/css/tabulator.css'
import logo from './assets/logo256.png'
import neo4j from 'neo4j-driver'


// get neo4j driver
const uri = process.env.REACT_APP_NEO4J_URI
const user = process.env.REACT_APP_NEO4J_USER
const password = process.env.REACT_APP_NEO4J_PASSWORD
// note: neo4j stores 64-bit ints, js only goes up to 53-bits (9e16)
// see https://github.com/neo4j/neo4j-javascript-driver#enabling-native-numbers
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), { disableLosslessIntegers: true })

//. put these into db also eventually

const projectQuery = `
MATCH (n)-[r:PROJECT]->(m:Project {name:$projectName}) 
OPTIONAL MATCH (n)-[:TIMEFRAME]->(t:Timeframe)
WITH n, labels(n) as type, collect(t.name) as timeframe, collect(m.name) as project, id(n) as id
RETURN n { .*, type, timeframe, project, id }
`
const projectCols = "id,project,type,name,timeframe,description"

const facetObjs = {
  personal: {
    query: projectQuery,
    params: { projectName: 'personal' },
    cols: projectCols,
    addQuery: `
    MATCH (m:Project {name:'personal'})
    CREATE (n:Task)-[:PROJECT]->(m)
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `
  },
  facets: {
    query: `
    MATCH (n:Facet) 
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `,
    cols: "id,type,name,description",
    addQuery: `
    CREATE (n:Facet)
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `,
  },
  neomem: {
    query: projectQuery,
    params: { projectName: 'neomem' },
    cols: projectCols,
  },
  tallieo: {
    query: projectQuery,
    params: { projectName: 'tallieo' },
    cols: projectCols,
  },
  projects: {
    query: `
    MATCH (n:Project) 
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }`,
    cols: "id,type,name,description",
  },
  people: {
    query: `
    MATCH (n:Person) 
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }`,
    cols: "id,type,name,description",
  },
  books: {
    query: `
    MATCH (n) 
    WHERE (n:Book) or (n:Author) 
    OPTIONAL MATCH (n)-[r:AUTHOR]->(m) 
    WITH n, collect(m.name) as author, labels(n) as type, id(n) as id
    RETURN n { .*, type, author, id }`,
    cols: "id,type,author,name",
  },
  timeframe: {
    query: `
    MATCH (n)-[r:PROJECT]->(m), (n)-[:TIMEFRAME]->(t) 
    WITH n, labels(n) AS type, collect(m.name) AS project , collect(t.name) AS timeframe, id(n) as id
    RETURN n {.*, type, project, timeframe, id }`,
    cols: "id,type,project,name,timeframe,description",
  },
}

//. put into db eventually
const colDefs = {
  id: { width: 50 },
  project: { width: 100 },
  type: { width: 100 },
  timeframe: { width: 100 },
  author: { width: 100 },
  name: { width: 250, editor: 'input' },
  description: { width: 350, editor: 'input' },
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


function App() {

  const [facet, setFacet] = React.useState("personal")
  const [query, setQuery] = React.useState("")
  const [params, setParams] = React.useState({})
  const [data, setData] = React.useState([])
  const [columns, setColumns] = React.useState([])

  React.useEffect(() => {
    if (!query) return
    const rows = []
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })
    //. do async await?
    session
      .run(query, params || {})
      .then(result => {
        result.records.forEach(record => {
          const row = record.get('n')
          Object.keys(row).forEach(key => {
            if (Array.isArray(row[key])) {
              row[key] = row[key].join(', ')
            }
          })
          rows.push(row)
        })
        const emptyRow = {}
        rows.push(emptyRow)
      })
      .catch(error => {
        console.error(error)
      })
      .then(() => {
        session.close()
        setData(rows)
      })
  }, [query, params])

  React.useEffect(() => {
    const facetObj = facetObjs[facet]
    const { query, params, cols } = facetObj
    setQuery(query)
    setParams(params)
    const colNames = cols.split(',')
    const columns = colNames.map(colName => colDefs[colName])
    setColumns(columns)
  }, [facet])

  function changeFocus(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  async function cellEdited(cell) {
    console.log(cell)
    const col = cell.getColumn()
    const field = col.getField()
    const colDef = col.getDefinition()
    const row = cell.getRow()
    const data = row.getData()
    let id = data.id
    const value = cell.getValue()
    const editor = colDef.editor
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
        const query = facetObj.addQuery
        const params = {}
        const result = await session.run(query, params)
        console.log(result)
        const record = result.records[0]
        console.log(record)
        const row = record.get('n')
        console.log(row)
        id = row.id
      }
      const query = `MATCH (t) WHERE id(t)=$id SET t.${field}=$value`
      const params = { id, value }
      const result = await session.run(query, params)
      console.log(result)
    }
    session.close()
  }

  return (
    <div className="app">
      
      <div className="app-header">
        
        <span className="app-header-logo">
          <img src={logo} alt="logo" /> 
          <span>Neomem</span>
        </span>

        <div className="app-header-facet">
          <span>Facet:&nbsp;</span>
          <select name="facet" id="facet" value={facet} onChange={changeFocus}>
            {Object.keys(facetObjs).map(facet => <option key={facet} value={facet}>{facet}</option>)}
          </select>
        </div>
        <div className="app-header-query">{query}</div>
      </div>
      
      <div className="app-contents">
        <ReactTabulator
          data={data}
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
