import React from 'react'
// import { ReactTabulator } from 'react-tabulator'
// import 'react-tabulator/css/tabulator.css'
import './styles.css'
// import '../table/tabulator.css' //. kludge - reach over and grab this for now


export default function NavigatorView({ items, clickItem, focusId }) {
  return (
    <div className='navigator-view'>
      {/* <div className='navigator-view-header'>Navigator</div> */}
      <div className="navigator-view-items">
        {items && items.map((item, i) => (
          <div 
            className={'navigator-view-item' + (item.id===focusId ? ' focus' : '')}
            key={item.name + i} 
            onClick={clickItem}
            data-id={item.id}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}
