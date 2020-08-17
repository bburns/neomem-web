import React from 'react'
import neo4jDatasource from '../datasources/neo4jDatasource'
import TableView from '../views/TableView'
import DocumentView from '../views/DocumentView'
import logo from '../assets/logo256.png'
import './styles.css'


const datasource = neo4jDatasource

//. these will need to get translated from generic datastructs into
// those specific to each datasource

const projectsQuery = `
MATCH (n:Project) 
OPTIONAL MATCH (n)-[:CLIENT]->(c)
WITH n, labels(n) as type, id(n) as id,
collect(c.name) as client
RETURN n { .*, type, id, client }
`
const projectsCols = "id,type,name,description,client"
const projectsAddQuery = `
CREATE (n:Project)
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`

const projectQuery = `
MATCH (n)-[r:PROJECT]->(m:Project {name:$projectName}) 
OPTIONAL MATCH (n)-[:TIMEFRAME]->(t:Timeframe)
WITH n, labels(n) as type, collect(t.name) as timeframe, 
collect(m.name) as project, 
id(n) as id
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
    addQuery: genericAddQuery,
    cols: genericCols,
  },
  all: {
    params: {},
    query: `
    MATCH (n) 
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `,
    cols: genericCols,
    addQuery: genericAddQuery,
  },
  projects: {
    params: {},
    query: projectsQuery,
    cols: projectsCols,
    addQuery: projectsAddQuery,
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
  story: {
    params: {},
    query: `
    MATCH (p:Project {name: 'blt'}) 
    MATCH (n)-[r*0..2]->(p) 
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `,
    cols: "id,type,name,description",
    // addQuery: genericAddQuery,
  },
}

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}



const emptyRow = { id:0 }


export default function App() {

  const [facet, setFacet] = React.useState("projects")
  const [facetObj, setFacetObj] = React.useState({})
  const [groupBy, setGroupBy] = React.useState("")
  const [view, setView] = React.useState("table")
  // const [query, setQuery] = React.useState("") // used to display query to user
  const [rows, setRows] = React.useState([])
  // const [columns, setColumns] = React.useState([])
  // const tableRef = React.useRef(null)
  const facetRef = React.useRef(facet) //. better way?

  React.useEffect(() => {
    facetRef.current = facet
    ;(async () => {

      const facetObj = facetObjs[facet]
      setFacetObj(facetObj)

      const queryTemplate = facetObj.query
      const params = facetObj.params || {}
      const query = substituteQueryParams(queryTemplate, params)
      // setQuery(query)

      if (!query) return
      console.log(query, params)
      const rows = []
      // const session = driver.session({ defaultAccessMode: neo4j.session.READ })
      const session = datasource.getSession(true)
      const result = await session.run(query, params)
      result.records.forEach(record => {
        const row = record.get('n')
        Object.keys(row).forEach(key => {
          if (Array.isArray(row[key])) {
            row[key] = row[key].join(', ')
          }
        })
        rows.push(row)
      })
      // rows.push(emptyRow)
      session.close()
      setRows(rows)
    })()
  }, [facet])

  function changeFacet(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  function changeGroupBy(e) {
    const groupBy = e.currentTarget.value
    setGroupBy(groupBy)
  }

  function changeView(e) {
    const view = e.currentTarget.value
    setView(view)
  }

  return (
    <div className="app">
      
      <div className="app-header">
        
        <div className="app-header-logo">
          <img src={logo} alt="logo" /> 
          <span>Neomem</span>
        </div>

        <div className="app-controls">
          <span className="app-controls-facet">
            <span>Facet:&nbsp;</span>
            <select name="facet" id="facet" value={facet} onChange={changeFacet}>
              {Object.keys(facetObjs).map(facet => <option key={facet} value={facet}>{facet}</option>)}
            </select>
          </span>
          <span className="app-controls-groupby">
            <span>Group:&nbsp;</span>
            <select name="groupby" id="groupby" value={groupBy} onChange={changeGroupBy}>
              <option value="">(none)</option>
              <option value="type">type</option>
              <option value="timeframe">timeframe</option>
              <option value="project">project</option>
              <option value="client">client</option>
            </select>
          </span>
          <span className="app-controls-view">
            <span>View:&nbsp;</span>
            <select name="view" id="view" value={view} onChange={changeView}>
              <option value="table">table</option>
              <option value="document">document</option>
              <option value="outline">outline</option>
            </select>
          </span>
        </div>
        {/* <div className="app-header-query">Query: {query}</div> */}
      </div>
      
      <div className="app-contents">
        {/* {view==="table" && //. react-tabulator doesn't like turning off and on like this */}
          <TableView
            visible={view==='table'}
            rows={rows}
            groupBy={groupBy}
            facetObj={facetObj} // for columns, addquery, params - //. better way?
            datasource={datasource}
          />
          {/* } */}
        {view==="document" &&
          <DocumentView 
            rows={rows}
            groupBy={groupBy}
            datasource={datasource}
          />}
      </div>
    </div>
  )
}
