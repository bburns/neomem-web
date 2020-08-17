import React from 'react'
import './styles.css'


//. group rows by groupBy field, display with larger header

export default function DocumentView({ rows, groupBy }) {
  return (
    <div className="document-view">
      {rows.map(row => {
        return (
          <div key={row.id} className="document-section">
            <div className="document-header">{row.type}: {row.name}</div>
            <div className="document-notes">{row.description}</div>
          </div>
        )
      })}
    </div>
  )
}
