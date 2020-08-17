import React from 'react'
import './styles.css'


export default function DocumentView({ rows, groupBy }) {
  return (
    <div className="document-view">
      {rows.map(row => {
        return (
          <div key={row.id}>
            <div>{row.name}</div>
            <div>{row.description}</div>
          </div>
        )
      })}
    </div>
  )
}
