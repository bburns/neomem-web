import React from 'react'
// import Editor from 'rich-markdown-editor'
import _ from 'lodash'
import './styles.css'


//. group rows by groupBy field, display with larger header

export default function DocumentView({ rows, groupBy }) {
  
  const [groups, setGroups] = React.useState({})
  
  React.useEffect(() => {
    const groups = _.groupBy(rows, row => row[groupBy])
    setGroups(groups)
    console.log(groups)
  }, [rows, groupBy])

  return (
    <div className="document-view">
      {Object.keys(groups).map(group => {
        return (
          <div className="document-group">
            <div className="document-group-header">{groupBy}: {group}</div>
            {groups[group].map(row => {
              return (
                <div key={row.id} className="document-section">
                  <div className="document-header">{row.type}: {row.name}</div>
                  {/* <Editor defaultValue={row.description} /> */}
                  <textarea className="document-notes" defaultValue={row.description} />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
