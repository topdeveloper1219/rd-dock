import React from 'react';
import ReactDOM from 'react-dom';
import {DockLayout, DockContextType, DragStore} from '../lib';

let group = {
  floatable: true,
  closable: true,
  panelExtra: (panelData, context) => (
    <div className='my-panel-close-btn'
         onClick={() => context.dockMove(panelData, null, 'remove')}>
      X
    </div>
  )
};

let tab = {
  title: 'Tab',
  content: (
    <div>
      <p>Custom component can be added to panel's title bar.</p>
      <p>This panel has a close all button</p>
    </div>),
  group: 'close-all'
};

let count = 0;

function newTab() {
  return {
    id: `newtab${++count}`,
    title: 'New Tab',
    content: (
      <div>
        <p>This panel has an 'add' button</p>
      </div>),
    group: 'close-all'
  };
}

let box = {
  dockbox: {
    mode: 'horizontal',
    children: [
      {
        mode: 'vertical',
        size: 500,
        children: [
          {
            tabs: [{...tab, id: 't1'}, {...tab, id: 't2'}],
          },
          {
            tabs: [newTab(), newTab()],
            panelLock: {
              panelExtra: (panelData, context) => (
                <button
                  onClick={() => context.dockMove(newTab(), panelData, 'middle')}>
                  add
                </button>
              )
            }
          },
        ]
      },
      {
        size: 300,
        tabs: [{...tab, id: 't5'}, {...tab, id: 't6'}],
      },
    ]
  },
  groups: {
    'close-all': group
  }
};

class Demo extends React.Component {
  render() {
    return (
      <DockLayout defaultLayout={box} style={{position: 'absolute', left: 10, top: 10, right: 10, bottom: 10}}/>
    );
  }
}

ReactDOM.render(<Demo/>, document.getElementById('app'));
