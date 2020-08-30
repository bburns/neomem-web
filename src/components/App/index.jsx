import React from "react"
import datasource from "../../plugins/datasources/neo4j"
import TableView from "../../plugins/views/table"
import DocumentView from "../../plugins/views/document"
import logo from "../../assets/logo256.png"
import facetObjs from './facetObjs'
import getItem from '../getItem'
import 'semantic-ui-css/semantic.min.css'
import "./styles.css"
import { Button } from 'semantic-ui-react'
import GetItem2 from '../getItem2'
import { Dropdown } from 'semantic-ui-react'
import { Input } from 'semantic-ui-react'
import { Menu } from 'semantic-ui-react'
import { Container } from 'semantic-ui-react'
import { Header } from 'semantic-ui-react'
import { Image } from 'semantic-ui-react'
// import { Sticky } from 'semantic-ui-react'


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

const groups = '(none),type,relntype,timeframe,project,client'.split(',')
const groupOptions = groups.map(group => ({ key:group, text:group, value:group }))

const sorts = '(none),project,type,name,notes,order,timeframe'.split(',')
const sortOptions = sorts.map(sort => ({ key:sort, text:sort, value:sort }))


async function getChildren(query, params) {
  const session = datasource.getSession({ readOnly: true })
  const rows = []
  const result = await session.run(query, params)
  for (const record of result.records) {
    const row = record.get("n")
    // join any array fields into a comma-separated string
    Object.keys(row).forEach((key) => {
      if (key === "timeframe") { //.
        row[key] = row[key][0]
          ? row[key][0].properties
          : { name: "", order: 10 } //.
      } else if (Array.isArray(row[key])) {
        row[key] = row[key].join(", ")
      }
    })
    //. generalize more
    if (row.hasChildren) {
      // console.log('recurse on', row, 'with', row.id)
      row._children = await getChildren(query, {parentId:row.id})
    }
    rows.push(row)
  }
  session.close()
  return rows
}


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
    const facetObj = facetObjs[facet]
    setFacetObj(facetObj)

    const queryTemplate = facetObj.query
    const params = facetObj.params || {}
    const query = substituteQueryParams(queryTemplate, params)
    if (!query) return

    (async () => {
      const rows = await getChildren(query, params)
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

    // const item = { name: 'pokpok', notes: '', project: '', timeframe: '', type: '' }

    const session = datasource.getSession()

    const query = `
    CREATE (n)
    SET n.name="New Item"
    WITH n, labels(n) as type, id(n) as id
    RETURN n { .*, type, id }
    `
    // const params = { label: 'Node' }
    // const query = substituteQueryParams(queryTemplate, params)

    const result = await session.run(query)
    const record = result.records[0]
    const item = record.get('n')
    console.log(item)

    const ret = await getItem({ item })
    if (ret.ok) {
      // add ret.item to views
      const rowsCopy = [...rows, ret.item]
      setRows(rowsCopy)
    } else {
      // delete the node
      const query = `MATCH (n) WHERE id(n)=${item.id} DETACH DELETE n`
      const result = await session.run(query)
      console.log(result)
    }

    session.close()
  }

  return (
    <div className="app">

      <div className="app-header">

        {/* <Menu inverted> */}
          <div className="app-header-logo">
            <img src={logo} alt="logo" />
            <span>Neomem</span>
          </div>
        {/* </Menu> */}
        
        {/* <Header.Subheader>
          <Menu inverted>

            <Menu.Item>
              Facet: <Dropdown simple item selection options={facetOptions} /> 
            </Menu.Item>

            <Menu.Item>
              Group: <Dropdown simple item selection options={groupOptions} />
            </Menu.Item>

            <Menu.Item>
              Sort: <Dropdown simple item selection options={sortOptions} />
            </Menu.Item>

            <Menu.Item>
              <GetItem2 />
            </Menu.Item>
          </Menu>
        </Header.Subheader> */}


        <div className="app-controls">

          <span className="app-controls-facet">
            <span>Facet:&nbsp;</span>
            <select
              name="facet"
              id="facet"
              value={facet}
              onChange={changeFacet}
            >
              {facetOptions.map(facet => (
                <option key={facet.key} value={facet.value}>
                  {facet.text}
                </option>
              ))}
            </select>
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
              {groupOptions.map(group => (
                <option value={group.value} key={group.key}>
                  {group.text}
                </option>
              ))}
              {/* <option value="">(none)</option> */}
            </select>
          </span>

          <span className="app-controls-sortby">
            <span>Sort:&nbsp;</span>
            <select name="sortby" id="sortby" value={sortBy} onChange={e=>changeSort(e.currentTarget.value)}>
              {sortOptions.map(sort => (
                <option value={sort.value} key={sort.key}>
                  {sort.text}
                </option>
              ))}
              {/* <option value="">(none)</option> */}
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
            <Button basic color='green' size='mini' onClick={clickNew}>New</Button>
          </span>

          <span className="app-controls-new">
            <GetItem2 />
          </span>

        {/* </div> */}
        {/* <div className="app-header-query">Query: {query}</div> */}
      </div>
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
