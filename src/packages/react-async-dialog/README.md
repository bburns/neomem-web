# react-async-dialog

Open a modal dialog with async/await

Version 2020-09


## Example Usage

>make a codesandbox


test.jsx:

```js
import React from 'react'
import getValue from './getValue'

export default function() {
  async function clickButton() {
    const ret = await getValue(item)
    if (ret.ok) {
      console.log(ret.value)
    }
  }
  return <button onClick={clickButton}>Get Value</button>
}
```


getValue.jsx:

```js
import React from 'react'
import { openDialog, closeDialog } from 'react-async-dialog'
import './styles.css'


export default function getValue(initialValue) {
  return new Promise((resolve, reject) => {
    openDialog(GetValue, { initialValue, resolve })
  })
}


function GetValue({ initialValue, resolve }) {

  const [value, setValue] = React.useState(initialValue)
  function clickPlus() { setValue(value => value + 1) }
  function clickMinus() { setValue(value => value - 1) }
  
  function clickOK() {
    closeDialog()
    resolve({ ok: true, value })
  }
  
  function clickCancel() {
    closeDialog()
    resolve({ ok: false })
  }

  return (
    <div className="getValue">
      <span>{value}</span>
      <button onClick={clickMinus}>-1</button>
      <button onClick={clickPlus}>+1</button>
      <button onClick={clickCancel}>Cancel</button>
      <button onClick={clickOK}>OK</button>
    </div>
  )
}
```
