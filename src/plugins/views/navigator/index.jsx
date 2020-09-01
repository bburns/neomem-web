import React from 'react'
import './styles.css'

export default function NavigatorView({ items }) {
  return (
    <div className='navigator-view'>
      <div>Navigator</div>
        {items && items.map((item, i) => (
          <div className='navigator-view-item' key={item.name + i}>{item.name}</div>
        ))}
    </div>
  )
}
