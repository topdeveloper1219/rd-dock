import React from 'react';
import ReactDOM from 'react-dom';
import {Divider} from '../lib';
// keep the above unused import so tools script can understand this jsx

let demos = ['basic', 'panel-style', 'drop-mode', 'tab-update', 'save-layout', 'panel-extra'];
let advance = ['new-window', 'adv-tab-update', 'adv-save-layout', 'controlled-layout', 'tab-cache', 'divider-box'];

let defaultPage = window.location.hash.substr(1);
if (!(demos.includes(defaultPage) || advance.includes(defaultPage))) {
  defaultPage = 'basic';
}

class App extends React.Component {
  state = {current: defaultPage};

  render() {
    let {current} = this.state;
    let demoPages = [];
    for (let page of demos) {
      let cls = '';
      if (page === current) {
        cls = 'current';
      }
      demoPages.push(
        <a href={`#${page}`} key={page} className={cls} onClick={(e) => this.setState({current: page})}>
          {page}
        </a>
      )
    }
    let advancePages = [];
    for (let page of advance) {
      let cls = '';
      if (page === current) {
        cls = 'current';
      }
      advancePages.push(
        <a href={`#${page}`} key={page} className={cls} onClick={(e) => this.setState({current: page})}>
          {page}
        </a>
      )
    }
    return (
      <div>
        <nav className='nav'>
          <h2><a href='https://ticlo.github.io/rc-dock'>rc-dock</a></h2>
          <div className='nav'>
            <div className='link-bar'>
              <a href='https://github.com/ticlo/rc-dock/tree/master/example'>
                Examples:
              </a><br/>
              {demoPages}
            </div>
            <div className='link-bar'>
              <a href='https://github.com/ticlo/rc-dock/tree/master/example'>
                Advanced:
              </a><br/>
              {advancePages}
            </div>
          </div>
        </nav>
        <iframe src={`./${current}.html`}/>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
