import React from "react"
// import * as source from "../../plugins/source/neo4j"
import source from 'neomem-source'
import logo from "../../assets/logo256.png"
import facetObjs from './facetObjs'
import 'semantic-ui-css/semantic.min.css'
import "./styles.css"
import * as lib from '../../lib'
import colDefs from './colDefs'
import { Button } from 'semantic-ui-react'
// import { Dropdown } from 'semantic-ui-react'
// import { Input } from 'semantic-ui-react'
// import { Menu } from 'semantic-ui-react'
// import { Container } from 'semantic-ui-react'
// import { Header } from 'semantic-ui-react'
// import { Image } from 'semantic-ui-react'
// import { Sticky } from 'semantic-ui-react'

//. these will be plugin packages eg neomem-view-table
import TableView from "../../plugins/views/table"
// import DocumentView from "../../plugins/views/document"
// import HeaderView from "../../plugins/views/header"
// import NavigatorView from "../../plugins/views/navigator"
// import getItem from '../getItem' // get item dialog
// import GetItem2 from '../getItem2'


const initialFacet = "all"
const newRow = { id: -1 }
const showControls = false



const facetOptions = Object.keys(facetObjs).map(facet => (
  { key:facet, text:facet, value:facet }
))

const groups = '(none),type,relntype,timeframe,project,client'.split(',')
const groupOptions = groups.map(group => ({ key:group, text:group, value:group }))
groupOptions[0].value = ''

const sorts = '(none),project,type,name,notes,order,timeframe'.split(',')
const sortOptions = sorts.map(sort => ({ key:sort, text:sort, value:sort }))
sortOptions[0].value = ''

//. how get value? doesn't get assigned to the div?
// const viewOptions = [
//   { key: 'table', icon: 'table', text: 'table', value: 'table' },
//   { key: 'document', icon: 'file alternate outline', text: 'document', value: 'document' },
// ]


// // run query recursively
// async function getChildren(query, params) {
//   const session = source.getSession({ readOnly: true })
//   const rows = []
//   const result = await session.run(query, params)
//   for (const record of result.records) {
//     const row = record.get("n")
//     // join any array fields into a comma-separated string
//     Object.keys(row).forEach((key) => {
//       if (key === "timeframe") { //. make generic
//         row[key] = row[key][0]
//           ? row[key][0].properties // this includes { name, order, notes, ... }
//           : { name: "", order: 10 } //.
//       } else if (Array.isArray(row[key])) {
//         row[key] = row[key].join(", ")
//       }
//     })
//     // recurse if item has children
//     //. generalize more
//     if (row.hasChildren) {
//       row._children = await getChildren(query, {parentId:row.id})
//     }
//     rows.push(row)
//   }
//   session.close()
//   return rows
// }


export default function App() {

  const [facet, setFacet] = React.useState(initialFacet)
  const [facetObj, setFacetObj] = React.useState({})
  const [filterBy, setFilterBy] = React.useState("")
  const [groupBy, setGroupBy] = React.useState("")
  const [sortBy, setSortBy] = React.useState("")
  const [view, setView] = React.useState("table")
  const [rows, setRows] = React.useState([]) // for table/doc views
  const [navRows, setNavRows] = React.useState([]) // for nav view
  const [focusId, setFocusId] = React.useState(-2) // ~ facet
  const [focusItem, setFocusItem] = React.useState({})
  const [currentId, setCurrentId] = React.useState() // eg row in table

  const facetRef = React.useRef(facet) //. better way?

  //. new button dropdown options - incl add new link
  // const newOptions = [
  //   { key: 'item', icon: 'file outline', text: 'New Item', value: 'item', onClick: clickNewItem },
  //   { key: 'link', icon: 'linkify', text: 'New Link', value: 'link', onClick: clickNewLink },
  // ]
  
  React.useEffect(() => {
    source.init()
  }, [])

  // initial query
  // this is for the nav view
  React.useEffect(() => {
    (async () => {
      const items = await source.list()
      // items.sort((a, b) => a.name.localeCompare(b.name))
      setNavRows(items) // this will force dependent views to redraw
    })()
  }, [])

  // // on change focusId
  // // for the header view when nav focus changes
  // React.useEffect(() => {
  //   (async () => {
  //     const query = `
  //     MATCH (n)
  //     WHERE id(n)=$id
  //     RETURN n
  //     `
  //     const params = { id: focusId }
  //     const session = source.getSession({ readOnly: true })
  //     const items = []
  //     console.log(query, params)
  //     const result = await session.run(query, params)
  //     for (const record of result.records) {
  //       const item = record.get("n") // { identity, labels, properties }
  //       items.push(item)
  //     }
  //     const item = items[0]
  //     session.close()
  //     setFocusItem(item) // this will force dependent views to redraw
  //   })()
  // }, [focusId])


  // on change facet
  React.useEffect(() => {

    facetRef.current = facet
    const facetObj = facetObjs[facet]
    console.log(facetObj)
    setFacetObj(facetObj) // pass to dependent views

    const queryTemplate = facetObj.query
    const params = facetObj.params || {}
    const query = lib.substituteQueryParams(queryTemplate, params)
    if (!query) return;
    
    (async () => {
      // const rows = await getChildren(query, params) // recursive query
      const rows = await source.list() // recursive query
      setRows(rows) // this will force dependent views to redraw
    })()
    
  }, [facet])

  // on change sort
  React.useEffect(() => {
    const rowsCopy = [...rows]
    console.log('sortby', sortBy, rows)
    //. get propdef.datatype to switch on here
    if (sortBy === "timeframe") { //.
      rowsCopy.sort((a, b) => a[sortBy].order - b[sortBy].order)
    // } else if (sortBy === "order") { //. ie numeric
    } else if (sortBy==="order" || sortBy==='created' || sortBy==='modified') { //. numeric
      rowsCopy.sort((a, b) => (a[sortBy]||Infinity) - (b[sortBy]||Infinity))
    } else {
      //. sort undefineds at the end - klunky - better way?
      rowsCopy.sort((a, b) => (a[sortBy]||'zzz').localeCompare(b[sortBy]||'zzz'))
    }
    setRows(rowsCopy)
  }, [sortBy]) // react gives warning that needs rows here, but causes infinite loop!


  function changeFacet(e) {
    const facet = e.currentTarget.value
    setFacet(facet)
  }

  // function changeFilter(e) {
  //   const filterBy = e.currentTarget.value
  //   setFilterBy(filterBy)
  // }

  function changeGroup(e) {
    const groupBy = e.currentTarget.value
    setGroupBy(groupBy)
  }

  function changeSort(sortBy) {
    setSortBy(sortBy)
  }

  // function changeView(e) {
  //   console.log(e.currentTarget)
  //   const view = e.currentTarget.value
  //   setView(view)
  // }

  // //. dialog version - save for october
  // async function clickNewItem() {

  //   const session = source.getSession()
  //   const query = `
  //   CREATE (n)
  //   SET n.name="new item"
  //   WITH n, labels(n) as type, id(n) as id
  //   RETURN n { .*, type, id }
  //   `
  //   const result = await session.run(query)
  //   const record = result.records[0]
  //   const item = record.get('n')
  //   session.close()

  //   item.notes = ''
  //   // item.project = ''
  //   // item.timeline = ''

  //   const ret = await getItem({ item, source }) // bring up dialog

  //   if (ret.ok) {
  //     // add new item to rows, which will update the views
  //     const rowsCopy = [...rows, ret.item]
  //     setRows(rowsCopy)
  //     //. also tell them we selected that item
  //     // setSelection(ret.item)
  //   } else {
  //     // delete the new item
  //     const query = `MATCH (n) WHERE id(n)=${item.id} DETACH DELETE n`
  //     const session = source.getSession()
  //     const result = await session.run(query)
  //     session.close()
  //     console.log(result)
  //   }

  // }

  function clickNewItem() {
    // add new row to end of rows
    const rowsCopy = [...rows, newRow]
    setRows(rowsCopy)
    // now scroll that row into view and start editing name cell
    setCurrentId(newRow.id)
  }

  // //. let user choose an item to link to via a dialog with filterlist
  // function clickNewLink() {
  //   alert('lkmlkm')
  // }

  //. set focus to an item - callback for nav view
  function clickItem(e) {
    const ct = e.currentTarget
    const id = Number(ct.dataset.id)
    setFocusId(id)
  }


  return (
    <div className="app">

      <div className="app-header">

        <div className="app-header-logo">
          <img src={logo} alt="logo" />
          <span>Neomem</span>
        </div>

        {/* <div className="header-view">
          <HeaderView item={focusItem} />
        </div> */}
        
        {showControls && <div className="app-controls">

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
            </select>
          </span>

          {/* <span className="app-controls-view">
            <span>View:&nbsp;</span>
            <select name="view" id="view" value={view} onChange={changeView}>
              <option value="table">table</option>
              <option value="document">document</option>
            </select>
          </span> */}

          {/* <span>
            <Dropdown
              size='mini'
              className='button icon'
              floating
              button
              value={view}
              options={viewOptions}
              trigger={<>{view}</>}
              onChange={changeView}
            />
          </span> */}

          <span className="app-controls-new">
            
            {/* <Button basic color='green' size='mini' onClick={clickNew}>
              New
            </Button> */}

            <Button.Group color='green' size='mini' basic>
              <Button onClick={clickNewItem}>New</Button>
              {/* <Dropdown
                size='mini'
                className='button icon'
                floating
                options={newOptions}
                trigger={<></>}
              /> */}
            </Button.Group>
          </span>

          {/* <span className="app-controls-new">
            <GetItem2 />
          </span> */}

      </div>}
    </div>
      
      <div className="app-contents">

        {/* //. nav view */}
        {/* <NavigatorView items={items} clickItem={clickItem} focusId={focusId} /> */}
        <TableView
          visible
          rows={navRows}
          colDefs={colDefs}
          cols={['name','type']}
          clickItem={clickItem}
          focusId={focusId}
        />

        <div className="app-view">
          {/* {view==="table" && //. react-tabulator doesn't like turning off and on like this */}
          {/* <TableView
            visible={view === "table"}
            rows={rows}
            groupBy={groupBy}
            facetObj={facetObj} // for columns, addquery, params
            colDefs={colDefs}
            datasource={source}
            changeSort={changeSort}
            clickNew={clickNewItem}
            currentId={currentId}
          /> */}
          {/* } */}
          {/* {view === "document" && (
            <DocumentView 
              rows={rows} 
              groupBy={groupBy} 
              datasource={source} 
            />
          )} */}
        </div>
      </div>
    </div>
  )
}
