import React from 'react'
import { openDialog, closeDialog } from '..'


export default function getText(title, message, defaultValue) {
  return new Promise(resolve => {
    openDialog(GetText, { title, message, defaultValue, resolve })
  })
}


function GetText({ title, message, defaultValue, resolve }) {
  // const [value, setValue] = React.useState(defaultValue)
  const clickOK = () => {
    const textarea = document.querySelector('#getText-input')
    const value = textarea.value
    closeDialog()
    resolve({ ok: true, value })
  }
  const clickCancel = () => {
    closeDialog()
    resolve({ ok: false })
  }
  // function handleKeyDown(evt) {
  //   if (evt.key === "Enter") {
  //     clickOK()
  //   } else if (evt.key === "Escape") {
  //     clickCancel()
  //   }
  // }
  // function changeInput(evt) {
  //   setValue(evt.target.value)
  // }
  return (
    <div className='getText'>
      <h3>{title}</h3>
      <p>{message}</p>
      <div>
        <textarea 
          autoFocus 
          defaultValue={defaultValue}
          // value={value} 
          // onChange={changeInput} 
          // type="text" 
          id="getText-input" 
          // onKeyDown={handleKeyDown} 
        />
      </div>
      <div className="getText-buttons">
        <button id="cancel" onClick={clickCancel}>Cancel</button>
        <button id="ok" onClick={clickOK}>OK</button>
      </div>
    </div>
  )
}
