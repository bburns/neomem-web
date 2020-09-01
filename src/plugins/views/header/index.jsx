import React from 'react'
import './styles.css'

export default function HeaderView({ item }) {
  console.log(item)
  const type = item.labels && item.labels.join(', ')
  const props = item.properties
  return (
    <div className='header-view'>
      {type}{type && ':'} {props && props.name}
    </div>
  )
}
