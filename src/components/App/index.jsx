import React from "react"
import datasource from "../../plugins/datasources/neo4j"
import TableView from "../../plugins/views/table"
import DocumentView from "../../plugins/views/document"
import logo from "../../assets/logo256.png"
import facetObjs from './facetObjs'
import getItem from '../getItem'
import 'semantic-ui-css/semantic.min.css'
import "./styles.css"
// import { Button } from 'semantic-ui-react'
import GetItem2 from '../getItem2'
import { Dropdown } from 'semantic-ui-react'
import { Menu } from 'semantic-ui-react'


const initialFacet = "all"
// const emptyRow = { id: -1 }

function substituteQueryParams(query, params) {
  for (const key of Object.keys(params)) {
    const value = params[key]
    query = query.replace("#" + key + "#", value)
  }
  return query
}



const facetOptions = Object.keys(facetObjs).map(facet => (
  { key:facet, text:facet, value:facet }
))


export default function App() {

  const [facet, setFacet] = React.useState(initialFacet)
  const [facetObj, setFacetObj] = React.useState({})
  const [filterBy, setFilterBy] = React.useState("")
  const [groupBy, setGroupBy] = React.useState("")
  const [sortBy, setSortBy] = React.useState("")
  const [view, setView] = React.useState("table")
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
      if (!query) return

      const rows = []
      // const session = driver.session({ defaultAccessMode: neo4j.session.READ })
      const session = datasource.getSession({ readOnly: true })
      const result = await session.run(query, params)
      result.records.forEach((record) => {
        const row = record.get("n")
        // join any array fields into a comma-separated string
        Object.keys(row).forEach((key) => {
          if (key === "timeframe") {
            row[key] = row[key][0]
              ? row[key][0].properties
              : { name: "", order: 10 } //.
          } else if (Array.isArray(row[key])) {
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
    if (sortBy === "timeframe") { //.
      rowsCopy.sort((a, b) => a[sortBy].order - b[sortBy].order)
    } else if (sortBy === "") {
    } else {
      //. sort undefineds at the end - klunky - better way?
      rowsCopy.sort((a, b) => (a[sortBy]||'zzz').localeCompare(b[sortBy]||'zzz'))
    }
    setRows(rowsCopy)
  }, [sortBy])

  function changeFacet(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  function changeFilter(e) {
    const filterBy = e.currentTarget.value
    setFilterBy(filterBy)
  }

  function changeGroup(e) {
    const groupBy = e.currentTarget.value
    setGroupBy(groupBy)
  }

  function changeSort(sortBy) {
    setSortBy(sortBy)
  }

  function changeView(e) {
    const view = e.currentTarget.value
    setView(view)
  }

  async function clickNew(e) {
    // alert('pok')
    const item = { name: 'pokpok' }
    const ret = await getItem({ item })
    if (ret.ok) {
      const item = ret.item
      //. write to datasource

    }
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-logo">
          <img src={logo} alt="logo" />
          <span>Neomem</span>
        </div>

        <Menu compact>
          <Menu.Item header>
            Neomem
          </Menu.Item>
          Facet
          <Dropdown simple item selection options={facetOptions} />
        </Menu>


        <div className="app-controls">
          <span className="app-controls-facet">
            <span>Facet:&nbsp;</span>
            {/* <select
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
            </select> */}
          </span>

          {/* <span className="app-controls-filterby">
            <span>Filter:&nbsp;</span>
            <select name="filterby" id="filterby" value={filterBy} onChange={changeFilter}>
              <option value="">(none)</option>
            </select>
          </span> */}

          <span className="app-controls-groupby">
            <span>Group:&nbsp;</span>
            <select
              name="groupby"
              id="groupby"
              value={groupBy}
              onChange={changeGroup}
            >
              <option value="">(none)</option>
              <option value="type">type</option>
              <option value="timeframe">timeframe</option>
              <option value="project">project</option>
              <option value="client">client</option>
            </select>
          </span>

          <span className="app-controls-sortby">
            <span>Sort:&nbsp;</span>
            <select name="sortby" id="sortby" value={sortBy} onChange={e=>changeSort(e.currentTarget.value)}>
              {/* //. these need to be associated with / obtained from the table view eh? */}
              <option value="">(none)</option>
              <option value="project">project</option>
              <option value="type">type</option>
              <option value="name">name</option>
              <option value="notes">notes</option>
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

          {/* <span className="app-controls-new">
            <Button color='green' size='tiny' onClick={clickNew}>New</Button>
          </span> */}

          <span className="app-controls-new">
            <GetItem2 />
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
          <DocumentView 
            rows={rows} 
            groupBy={groupBy} 
            datasource={datasource} 
          />
        )}
      </div>
    </div>
  )
}
