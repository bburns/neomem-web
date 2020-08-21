import React from 'react'
import datasource from '../datasources/neo4j'
import TableView from '../views/TableView'
import DocumentView from '../views/DocumentView'
import logo from '../assets/logo256.png'
import './styles.css'


// const initialFacet = 'neomem'
const initialFacet = 'all'

//. these will need to get translated from generic datastructs into
// those specific to each datasource


// reusable facet definitions

// do a union query to include the project item at the top of the results
const projectQuery = `
MATCH (n:Project {name:$projectName})
OPTIONAL MATCH (n)-[:TIMEFRAME]->(t:Timeframe)
WITH n, labels(n) as type, 'self' as rels, collect(t) as timeframe, 
$projectName as project, 
id(n) as id
RETURN n { .*, type, timeframe, project, id, rels }
UNION
MATCH (n)-[r]->(m:Project {name:$projectName}) 
OPTIONAL MATCH (n)-[:TIMEFRAME]->(t:Timeframe)
WITH n, labels(n) as type, collect(r) as rels, collect(t) as timeframe, 
$projectName as project, 
id(n) as id
RETURN n { .*, type, timeframe, project, id, rels }
`
const projectCols = "id,project,type,name,timeframe,description,rels"
const projectAddQuery = `
MATCH (m:Project {name:$projectName})
CREATE (n:Task)-[:PROJECT]->(m)
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`

// const genericQuery = `
// MATCH (n:#label#) 
// WITH n, labels(n) as type, id(n) as id
// RETURN n { .*, type, id }
// `
// const genericCols = "id,type,name,description"
const genericAddQuery = `
CREATE (n:#label#)
WITH n, labels(n) as type, id(n) as id
RETURN n { .*, type, id }
`

// facet definitions

const facetObjs = {
  
  // facets: {
  //   params: { label: 'Facet' },
  //   query: genericQuery,
  //   cols: genericCols,
  //   addQuery: genericAddQuery,
  // },
  
  all: {
    params: {},
    query: `
    MATCH (n) 
    OPTIONAL MATCH (n)-[]->(p:Project)
    OPTIONAL MATCH (n)-[]->(t:Timeframe)
    OPTIONAL MATCH (n)-[]->(place:Place)
    WITH n, labels(n) as type, collect(p.name) as project, collect(t) as timeframe, id(n) as id,
    collect(place.name) as place
    RETURN n { .*, type, project, timeframe, id, place }
    `,
    cols: "id,type,project,name,description,timeframe,place",
    addQuery: genericAddQuery,
  },

  projects: {
    params: {},
    query: `
    MATCH (n:Project) 
    OPTIONAL MATCH (n)-[:CLIENT]->(c)
    OPTIONAL MATCH (n)-[:TIMEFRAME]->(t)
    WITH n, labels(n) as type, id(n) as id,
    collect(c.name) as client, 
    collect(t.name) as timeframe
    RETURN n { .*, type, id, timeframe, client }
    `,
    cols: "id,type,name,description,timeframe,client",
    addQuery: `CREATE (n:Project)
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `,
  },
  
  personal: { params: { projectName: 'personal' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  
  neomem: { params: { projectName: 'neomem' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  
  // tallieo: { params: { projectName: 'tallieo' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  
  // facemate: { params: { projectName: 'facemate' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  
  // ccs: { params: { projectName: 'ccs' }, query: projectQuery, cols: projectCols, addQuery: projectAddQuery },
  
  // people: {
  //   params: { label: 'Person' },
  //   query: genericQuery,
  //   cols: genericCols,
  //   addQuery: genericAddQuery,
  // },
  
  // books: {
  //   query: `
  //   MATCH (n) 
  //   WHERE (n:Book) or (n:Author) 
  //   OPTIONAL MATCH (n)-[r:AUTHOR]->(m) 
  //   WITH n, collect(m.name) as author, labels(n) as type, id(n) as id
  //   RETURN n { .*, type, author, id }`,
  //   cols: "id,type,author,name,description",
  // },
  
  timeframe: {
    query: `
    MATCH (n)-[:TIMEFRAME]->(t) 
    OPTIONAL MATCH (n)-[:PROJECT]->(m)
    WITH n, labels(n) AS type, collect(m.name) AS project , collect(t.name) AS timeframe, id(n) as id
    RETURN n {.*, type, project, timeframe, id }`,
    cols: "id,type,project,name,timeframe,description",
  },
  
  story: {
    // params: {},
    // query: `
    // MATCH (p:Project {name: 'blt'}) 
    // MATCH path=(n)-[r*0..2]->(p) 
    // WITH n, labels(n) as type, id(n) as id, length(path) as depth
    // RETURN n { .*, type, id, depth }
    // `,
    // cols: "id,type,name,description,depth,order",
    query: `
    MATCH (p)
    WHERE id(p)=$parentId 
    MATCH (n)-[r]->(p) 
    WITH n, labels(n) as type, id(n) as id, type(r) as rels, $parentId as parentId
    RETURN n { .*, type, id, rels, parentId }
    `,
    params: { parentId: 48 }, // blt
    cols: "id,type,name,description,order,rels,parentId",
  },
}

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace('#' + key + '#', value)
  }  
  return query
}



const emptyRow = { id:-1 }


export default function App() {

  const [facet, setFacet] = React.useState(initialFacet)
  const [facetObj, setFacetObj] = React.useState({})
  const [filter, setFilter] = React.useState("")
  const [groupBy, setGroupBy] = React.useState("")
  const [sort, setSort] = React.useState("")
  const [view, setView] = React.useState("table")
  // const [query, setQuery] = React.useState("") // used to display query to user
  const [rows, setRows] = React.useState([])
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
        // join any array fields into a comma-separated string
        Object.keys(row).forEach(key => {
          if (key==='timeframe') {
            row[key] = row[key][0] ? row[key][0].properties.order : 10
          }
        //   if (Array.isArray(row[key])) {
        //     console.log('join array field', key, row[key])
        //     row[key] = row[key].join(', ')
        //   }
        })
        
        rows.push(row)
      })
      session.close()
      setRows(rows)
    })()
  }, [facet])


  // sort data
  React.useEffect(() => {
    const rowsCopy = [...rows]
    if (sort==='timeframe') {
      console.log(rows[0][sort])
      // rowsCopy.sort((a,b) => a[sort].order - b[sort].order)
      rowsCopy.sort((a,b) => a[sort] - b[sort])
    } else {
      rowsCopy.sort((a,b) => a[sort].localeCompare(b[sort]))
    }
    setRows(rowsCopy)
  }, [sort])


  function changeFacet(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  function changeFilter(e) {
    const filter = e.currentTarget.value
    setFilter(filter)
  }

  function changeGroupBy(e) {
    const groupBy = e.currentTarget.value
    setGroupBy(groupBy)
  }

  function changeSort(e) {
    const sort = e.currentTarget.value
    setSort(sort)
  }

  function changeView(e) {
    const view = e.currentTarget.value
    setView(view)
  }

  async function clickNew(e) {
    // const item = { name: 'pokpok' }
    // const response = await getItem(item)
    // if (response.ok) {
    //   //. write to datasource
    // }
  }

  return (
    <div className="app">
      
      <div className="app-header">
        
        <div className="app-header-logo">
          <img src={logo} alt="logo" /> 
          <span>Neomem</span>
        </div>

        <div className="app-controls">

          <button onClick={clickNew}>new</button>

          <span className="app-controls-facet">
            <span>Facet:&nbsp;</span>
            <select name="facet" id="facet" value={facet} onChange={changeFacet}>
              {Object.keys(facetObjs).map(facet => <option key={facet} value={facet}>{facet}</option>)}
            </select>
          </span>

          {/* <span className="app-controls-filter">
            <span>Filter:&nbsp;</span>
            <select name="filter" id="filter" value={filter} onChange={changeFilter}>
              <option value="">(none)</option>
            </select>
          </span> */}

          {/* <span className="app-controls-groupby">
            <span>Group:&nbsp;</span>
            <select name="groupby" id="groupby" value={groupBy} onChange={changeGroupBy}>
              <option value="">(none)</option>
              <option value="type">type</option>
              <option value="timeframe">timeframe</option>
              <option value="project">project</option>
              <option value="client">client</option>
            </select>
          </span> */}

          <span className="app-controls-sort">
            <span>Sort:&nbsp;</span>
            <select name="sort" id="sort" value={sort} onChange={changeSort}>
              <option value="">(none)</option>
              <option value="name">name</option>
              <option value="timeframe">timeframe</option>
              <option value="type">type</option>
              <option value="project">project</option>
            </select>
          </span>

          {/* <span className="app-controls-view">
            <span>View:&nbsp;</span>
            <select name="view" id="view" value={view} onChange={changeView}>
              <option value="table">table</option>
              <option value="document">document</option>
            </select>
          </span> */}

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
