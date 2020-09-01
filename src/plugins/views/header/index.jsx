import React from 'react'

export default function Header({ item }) {
  return (
    <div className='header'>
      {item.type}{item.type && ':'} {item.name}
    </div>
  )
}
