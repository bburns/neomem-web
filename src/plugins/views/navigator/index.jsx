import React from 'react'
import './styles.css'

export default function NavigatorView({ items }) {
  return (
    <div className='navigator-view'>
      <div className='navigator-view-header'>Navigator</div>
      <div className="navigator-view-items">
        {items && items.map((item, i) => (
          <div className='navigator-view-item' key={item.name + i}>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}
