import React from 'react'
import ReactDOM from 'react-dom'
import alert from  './dialogs/alert'
import getString from  './dialogs/getString'
import './styles.css'
export { alert, getString } //.


export function openDialog(Dialog, props, clickBackground=closeDialog) {
  const body = document.querySelector("body")
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
  // close the last react-async-dialog container, in case of nested dialogs
  const containers = document.getElementsByClassName("reactAsyncDialog-container")
  const container = containers[containers.length - 1]
  const body = document.querySelector("body") 
  body.removeChild(container) 
}
