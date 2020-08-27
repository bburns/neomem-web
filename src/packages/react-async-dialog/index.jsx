import React from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import alert from  './dialogs/alert'
import getString from  './dialogs/getString'
export { alert, getString }


export function openDialog(Dialog, props, clickBackground=closeDialog) {
  const body = document.getElementsByTagName("body")[0]
  const container = document.createElement("div")
  container.classList.add('reactAsyncDialog-container')
  container.onmousedown = function(evt) {
    if (evt.target === container) {
      clickBackground(evt)
    }
  }
  body.appendChild(container)
  ReactDOM.render(<Dialog {...props} />, container)
}


export function closeDialog(evt) {
  // const container = document.getElementsByClassName("reactAsyncDialog-container")[0]
  // close the last react-async-dialog container, in case of nested dialogs
  console.log(evt);
  const containers = document.getElementsByClassName("reactAsyncDialog-container")
  const i = containers.length - 1
  const container = containers[i]
  const body = document.getElementsByTagName("body")[0] 
  body.removeChild(container) 
}
