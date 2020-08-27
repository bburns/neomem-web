import React from 'react'
import { openDialog, closeDialog } from '../../packages/react-async-dialog'
import PropertyView from '../../plugins/views/property'
import './styles.css'


export default function getItem({ title, message, item }) {
  return new Promise(resolve => {
    openDialog(GetItem, { title, message, item, resolve })
  })
}


function GetItem({ title, message, item, resolve }) {
  // const [value, setValue] = React.useState(defaultValue)
  const clickOK = () => {
    closeDialog()
    resolve({ ok: true, item })
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
      <PropertyView item={item} />
      <div className="getItem-buttons">
        <button className="cancel" onClick={clickCancel}>Cancel</button>
        <button className="ok" onClick={clickOK}>OK</button>
      </div>
    </div>
  )
}
