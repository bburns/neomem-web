import React from 'react'
import { openDialog, closeDialog } from '..'


export default function getString(title, message, defaultValue) {
  return new Promise((resolve, reject) => {
    openDialog(GetString, { title, message, defaultValue, resolve })
  })
}


function GetString({ title, message, defaultValue, resolve }) {
  const [value, setValue] = React.useState(defaultValue)
  const handleClickedOK = () => {
    // const el = document.getElementById("getString-input")
    // const s = el.value
    closeDialog()
    resolve({ ok: true, value })
  }
  const handleClickedCancel = () => {
    closeDialog()
    resolve({ ok: false })
  }
  function handleKeyDown(evt) {
    if (evt.key === "Enter") {
      handleClickedOK()
    } else if (evt.key === "Escape") {
      handleClickedCancel()
    }
  }
  function changeInput(evt) {
    setValue(evt.target.value)
  }
  return (
    <div className='getString'>
      <h3>{title}</h3>
      <p>{message}</p>
      <div>
        <input autoFocus value={value} onChange={changeInput} type="text" id="getString-input" onKeyDown={handleKeyDown} />
      </div>
      <div className="getString-buttons">
        <button id="cancel" onClick={handleClickedCancel}>Cancel</button>
        <button id="ok" onClick={handleClickedOK}>OK</button>
      </div>
    </div>
  )
}
