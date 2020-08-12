import React from 'react'
import './App.css'
import { ReactTabulator } from 'react-tabulator'
// import 'react-tabulator/lib/styles.css'
import 'react-tabulator/css/tabulator.css'
import logo from './assets/logo256.png'
import neo4j from 'neo4j-driver'


// do simple query, get all the nodes, display in a table

const uri = 'neo4j://localhost'
// const uri = 'neo4j://35.225.192.145' // gcp vm neo4j instance
// const uri = 'neo4j://35.225.192.145:7473' // gcp vm neo4j instance
const user = process.env.REACT_APP_NEO4J_USER
const password = process.env.REACT_APP_NEO4J_PASSWORD
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session({ defaultAccessMode: neo4j.session.READ })
console.log(driver, session)

const columns = [
  { title: "Name", field: "name", width: 200 },
  { title: "When", field: "when", width: 80 },
  // { title: "Age", field: "age", hozAlign: "left", formatter: "progress" },
  // { title: "Favourite Color", field: "col" },
  // { title: "Date Of Birth", field: "dob", hozAlign: "center" },
  // { title: "Rating", field: "rating", hozAlign: "center", formatter: "star" },
  // { title: "Passed?", field: "passed", hozAlign: "center", formatter: "tickCross" }
];

// var data = [
//   {id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
//   {id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
//   {id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
//   {id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
//   {id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
// ];

// const query = "MATCH (n) RETURN n.name"
// const query = "MATCH (t:task)-[]->(p:project {name: 'neomem'}) RETURN t.name"
// const query = "MATCH (t:task)-[]->(p:project {name: 'neomem'}) RETURN t.name, t.when"
const query = "MATCH (n)-[]-(p:project {name:'neomem'}) RETURN n"

function App() {
  const [data, setData] = React.useState([])
  React.useEffect(() => {
    const rows = []
    session
      .run(query)
      .then(result => {
        result.records.forEach(record => {
          console.log(record)
          // const row = { name: record.get('t.name')}
          // const row = { name: record.get('t.name'), when: record.get('t.when')}
          // const row = { name: record.get('n').name, when: record.get('n').when}
          // rows.push(row)
          // const row = {}
          // let row = {}
          // record.forEach((value, key) => {row[key] = value; console.log(key, value)})
          // record.forEach((value, key) => {
          //   // row[key] = value; console.log(key, value)
          //   if (key==='n') {
          //     row = value.properties
          //   }
          // })
          const row = record.get('n').properties
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
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="logo" /> Neomem
      </header>
      <div>
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
