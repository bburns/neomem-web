import React from 'react'
import { openDialog, closeDialog } from '../../packages/react-async-dialog'
import PropertyView from '../../plugins/views/property'
import './styles.css'


export default function getItem({ title, message }) {
  return new Promise(resolve => {
    openDialog(GetString, { title, message, resolve })
  })
}


function GetString({ title, message, resolve }) {
  // const [value, setValue] = React.useState(defaultValue)
  const clickOK = () => {
    closeDialog()
    resolve({ ok: true })
  }
  const clickCancel = () => {
    closeDialog()
    resolve({ ok: false })
  }
  function handleKeyDown(evt) {
    if (evt.key === "Enter") {
      clickOK()
    } else if (evt.key === "Escape") {
      clickCancel()
    }
  }
  // function changeInput(evt) {
  //   setValue(evt.target.value)
  // }
  return (
    <div className='getItem'>
      <h3>{title}</h3>
      <p>{message}</p>
      <PropertyView />
      {/* <div>
        <input autoFocus value={value} onChange={changeInput} type="text" id="getString-input" onKeyDown={handleKeyDown} />
      </div> */}
      <div className="getItem-buttons">
        <button className="cancel" onClick={clickCancel}>Cancel</button>
        <button className="ok" onClick={clickOK}>OK</button>
      </div>
    </div>
  )
}
