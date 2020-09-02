import React from 'react'
import { openDialog, closeDialog } from '..'


export default function getText(title, message, defaultValue) {
  return new Promise(resolve => {
    openDialog(GetText, { title, message, defaultValue, resolve })
  })
}


function GetText({ title, message, defaultValue, resolve }) {

  // const [value, setValue] = React.useState(defaultValue)
  const [dirty, setDirty] = React.useState(false)

  function clickOK() {
    const textarea = document.querySelector('.getText-input')
    const value = textarea.value
    closeDialog()
    resolve({ ok: true, value })
  }

  function clickCancel() {
    //. check for dirty state
    closeDialog()
    resolve({ ok: false })
  }

  function handleKeyDown(event) {
    // if (event.key === "Enter") {
    //   clickOK()
    // } else 
    if (event.key === "Escape") {
      clickCancel()
    }
  }

  function changeInput() {
    setDirty(true)
  }

  return (
    <div className="getText">
      <h3>{title}</h3>
      <p>{message}</p>
      <textarea 
        className="getText-input" 
        autoFocus 
        defaultValue={defaultValue}
        onChange={changeInput} 
        onKeyDown={handleKeyDown} 
      />
      <div className="getText-buttons">
        <button id="cancel" onClick={clickCancel}>Cancel</button>
        <button id="ok" onClick={clickOK}>OK</button>
      </div>
    </div>
  )
}
