import React from 'react'
// import Editor from 'rich-markdown-editor'
import './styles.css'


//. group rows by groupBy field, display with larger header

export default function DocumentView({ rows, groupBy }) {
  return (
    <div className="document-view">
      {rows.map(row => {
        return (
          <div key={row.id} className="document-section">
            <div className="document-header">{row.type}: {row.name}</div>
            {/* <div className="document-header">{row.type}: <input type="text" defaultValue={row.name} /></div> */}
            {/* <div className="document-notes">{row.description}</div> */}
            {/* <Editor defaultValue={row.description} /> */}
            {/* <input className="document-notes" type="textarea" defaultValue={row.description} /> */}
            <textarea className="document-notes" defaultValue={row.description} />
          </div>
        )
      })}
    </div>
  )
}
