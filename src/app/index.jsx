import React from "react"
import datasource from "../datasources/neo4j"
import TableView from "../views/TableView"
import DocumentView from "../views/DocumentView"
import logo from "../assets/logo256.png"
import * as cypher from './cypher'
import "./styles.css"

// const initialFacet = 'neomem'
const initialFacet = "all"


// facet definitions
// const projectCols = "id,project,type,name,timeframe,description,rels"
const projectCols = "name,timeframe,description,place"

const facetObjs = {

  all: {
    cols: "name,project,description,timeframe,place,order",
    group: "type",
    query: cypher.facets.all.query,
    addQuery: cypher.facets.all.addQuery,
  },

  projects: {
    cols: "id,type,name,description,timeframe,client",
    group: "type",
    query: cypher.facets.projects.query,
    addQuery: cypher.facets.projects.addQuery,
  },

  personal: {
    params: { projectName: "personal" },
    cols: projectCols,
    query: cypher.facets.personal.query,
    addQuery: cypher.facets.personal.addQuery,
  },

  neomem: {
    params: { projectName: "neomem" },
    cols: projectCols,
    query: cypher.facets.neomem.query,
    addQuery: cypher.facets.neomem.addQuery,
  },

  tallieo: { 
    params: { projectName: 'tallieo' }, 
    cols: projectCols, 
    query: cypher.facets.tallieo.query,
    addQuery: cypher.facets.tallieo.addQuery,
  },

  // people: {
  //   cols: genericCols,
  //   params: { label: 'Person' },
  // },

  // books: {
  //   cols: "id,type,author,name,description",
  // },

  timeframe: {
    cols: "name,type,project,description",
    group: "timeframe",
    query: cypher.facets.timeframe.query,
    addQuery: cypher.facets.timeframe.addQuery,
  },

  story: {
    cols: "id,type,name,description,order,rels,parentId",
    // group: "uhhhhh", //. how recursively group? by eg a CHILD reln?
    // cols: "id,type,name,description,depth,order",
    params: { parentId: 48 }, // blt
    query: cypher.facets.story.query,
    addQuery: cypher.facets.story.addQuery,
  },
}

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace("#" + key + "#", value)
  }
  return query
}

const emptyRow = { id: -1 }

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

  // on change facet
  React.useEffect(() => {
    facetRef.current = facet;
    (async () => {
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
      result.records.forEach((record) => {
        const row = record.get("n")
        // join any array fields into a comma-separated string
        Object.keys(row).forEach((key) => {
          if (key === "timeframe") {
            row[key] = row[key][0]
              ? row[key][0].properties
              : { name: "", order: 10 }
          } else if (Array.isArray(row[key])) {
            console.log("join array field", key, row[key])
            row[key] = row[key].join(", ")
          }
        })

        rows.push(row)
      })
      session.close()
      setRows(rows)
    })()
  }, [facet])

  // on change sort
  React.useEffect(() => {
    const rowsCopy = [...rows]
    if (sort === "timeframe") {
      console.log(rows[0][sort])
      rowsCopy.sort((a, b) => a[sort].order - b[sort].order)
    } else if (sort === "") {
    } else {
      // rowsCopy.sort((a, b) => a[sort].localeCompare(b[sort]))
      //. sort undefineds at the end - klunky - better way?
      rowsCopy.sort((a, b) => (a[sort]||'zzz').localeCompare(b[sort]||'zzz'))
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

  function changeSort(sort) {
    // const sort = e.currentTarget.value
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
          <span className="app-controls-facet">
            <span>Facet:&nbsp;</span>
            <select
              name="facet"
              id="facet"
              value={facet}
              onChange={changeFacet}
            >
              {Object.keys(facetObjs).map((facet) => (
                <option key={facet} value={facet}>
                  {facet}
                </option>
              ))}
            </select>
          </span>

          {/* <span className="app-controls-filter">
            <span>Filter:&nbsp;</span>
            <select name="filter" id="filter" value={filter} onChange={changeFilter}>
              <option value="">(none)</option>
            </select>
          </span> */}

          <span className="app-controls-groupby">
            <span>Group:&nbsp;</span>
            <select
              name="groupby"
              id="groupby"
              value={groupBy}
              onChange={changeGroupBy}
            >
              <option value="">(none)</option>
              <option value="type">type</option>
              <option value="timeframe">timeframe</option>
              <option value="project">project</option>
              <option value="client">client</option>
            </select>
          </span>

          <span className="app-controls-sort">
            <span>Sort:&nbsp;</span>
            {/* <select name="sort" id="sort" value={sort} onChange={changeSort}> */}
            <select name="sort" id="sort" value={sort} onChange={e=>changeSort(e.currentTarget.value)}>
              {/* //. these need to be associated with / obtained from the table view eh? */}
              <option value="">(none)</option>
              <option value="project">project</option>
              <option value="type">type</option>
              <option value="name">name</option>
              <option value="description">description</option>
              <option value="order">order</option>
              <option value="timeframe">timeframe</option>
            </select>
          </span>

          {/* <span className="app-controls-view">
            <span>View:&nbsp;</span>
            <select name="view" id="view" value={view} onChange={changeView}>
              <option value="table">table</option>
              <option value="document">document</option>
            </select>
          </span> */}

          <span className="app-controls-new">
            <button onClick={clickNew}>new</button>
          </span>
        </div>
        {/* <div className="app-header-query">Query: {query}</div> */}
      </div>

      <div className="app-contents">
        {/* {view==="table" && //. react-tabulator doesn't like turning off and on like this */}
        <TableView
          visible={view === "table"}
          rows={rows}
          groupBy={groupBy}
          facetObj={facetObj} // for columns, addquery, params - //. better way?
          datasource={datasource}
          changeSort={changeSort}
        />
        {/* } */}
        {view === "document" && (
          <DocumentView rows={rows} groupBy={groupBy} datasource={datasource} />
        )}
      </div>
    </div>
  )
}
