import React from 'react'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.css'
import './styles.css'


export default function({ item }) {

  const columns = [
    {
      field: 'name',
      title: "Name",
    },
    {
      field: 'value',
      title: "Value",
    },
  ]

  const [rows, setRows] = React.useState([])

  React.useEffect(() => {
    if (item) {
      const rows = Object.keys(item).map(key => ({ name: key, value: item[key]}))
      setRows(rows)
    }
  }, [item])

  return (
    <div className='property-view'>
      <ReactTabulator
        // ref={tableRef}
        data={rows}
        columns={columns}
        // options={{groupBy, dataTree:true, dataSorting, dataSorted, rowFormatter }}
        tooltips={false}
        layout={"fitData"}
        // cellEdited={cellEdited}
      />
    </div>
  )
}
