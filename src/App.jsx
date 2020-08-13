import React from 'react'
import './App.css'
import { ReactTabulator } from 'react-tabulator'
// import 'react-tabulator/lib/styles.css'
import 'react-tabulator/css/tabulator.css'
import logo from './assets/logo256.png'
import neo4j from 'neo4j-driver'


// get neo4j driver
const uri = 'neo4j://localhost'
// const uri = 'neo4j://35.225.192.145' // gcp vm neo4j instance
// const uri = 'neo4j://35.225.192.145:7473' // gcp vm neo4j instance
const user = process.env.REACT_APP_NEO4J_USER
const password = process.env.REACT_APP_NEO4J_PASSWORD
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
console.log(driver)


const facetObjs = {
  personal: {
    query: "MATCH (n)-[r:PROJECT]->(m:Project {name:'personal'}) WITH n, labels(n) as type RETURN n {.*, type}",
    cols: "type,name,when",
  },
  neomem: {
    query: "MATCH (n)-[r:PROJECT]->(m:Project {name:'neomem'}) WITH n, labels(n) as type RETURN n {.*, type}",
    cols: "type,name,when",
  },
  tallieo: {
    query: "MATCH (n)-[r:PROJECT]->(m:Project {name:'tallieo'}) WITH n, labels(n) as type RETURN n {.*, type}",
    cols: "type,name,when",
  },
  books: {
    query: "MATCH (n) WHERE (n:Book) or (n:Author) OPTIONAL MATCH (n)-[r:AUTHOR]->(m) WITH n, collect(m.name) as author, labels(n) as type RETURN n { .*, type, author }",
    cols: "type,author,name",
  },
  timeframe: {
    query: "MATCH (n)-[r:PROJECT]->(m) WHERE EXISTS (n.when) WITH n, labels(n) as type, collect(m.name) as project RETURN n {.*, type, project}",
    cols: "type,project,name,when",
  },
}

const colDefs = {
  project: { title: "Project", width: 120 },
  type: { title: "Type", width: 120 },
  name: { title: "Name", width: 300 },
  when: { title: "When", width: 80 },
  author: { title: "Author", width: 150 },
}
Object.keys(colDefs).forEach(key => colDefs[key].field = key)


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
  const [data, setData] = React.useState([])
  const [columns, setColumns] = React.useState([])

  React.useEffect(() => {
    if (!query) return
    const rows = []
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })
    //. do async await
    session
      .run(query)
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
      })
      .catch(error => {
        console.error(error)
      })
      .then(() => {
        session.close()
        setData(rows)
      })
  }, [query])

  React.useEffect(() => {
    const facetObj = facetObjs[facet]
    const { query, cols } = facetObj
    setQuery(query)
    const colNames = cols.split(',')
    const columns = colNames.map(colName => colDefs[colName])
    setColumns(columns)
  }, [facet])

  function changeFocus(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
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
          tooltips={true}
          layout={"fitData"}
        />
      </div>
    </div>
  )
}

export default App
