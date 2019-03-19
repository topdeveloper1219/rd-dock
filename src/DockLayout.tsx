import React, {CSSProperties} from "react";
import {BoxData, LayoutData, PanelData, DockContextProvider, nextId, DockContext, DropDirection} from "./DockData";
import {DockBox} from "./DockBox";
import {FloatBox} from "./FloatBox";
import {Simulate} from "react-dom/test-utils";
import drop = Simulate.drop;

interface Props {
  defaultLayout: LayoutData | BoxData | (BoxData | PanelData)[];
  style?: CSSProperties;
}

interface State {
  layout: LayoutData;
  dropRect?: {left: number, width: number, top: number, height: number, element: HTMLElement, direction?: DropDirection};
}

export class DockLayout extends React.PureComponent<Props, State> implements DockContext {

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };


  fixPanelData(panel: PanelData) {
    panel.id = nextId();
    if (!(panel.size > 0)) {
      panel.size = 200;
    }
    for (let child of panel.tabs) {
      child.parent = panel;
    }
  }

  fixBoxData(box: BoxData) {
    box.id = nextId();
    if (!(box.size > 0)) {
      box.size = 200;
    }
    for (let child of box.children) {
      child.parent = box;
      if ('children' in child) {
        // add box id
        this.fixBoxData(child);
      } else if ('tabs' in child) {
        // add panel id
        this.fixPanelData(child);

      }
    }
  }

  prepareInitData(data: LayoutData | BoxData | (BoxData | PanelData)[]): LayoutData {
    let layout: LayoutData;
    if (Array.isArray(data)) {
      layout = {
        dockbox: {mode: 'horizontal', children: data, size: 1}
      };
    } else if ('dockbox' in data || 'floatbox' in data) {
      layout = data;
    } else if ('children' in data) {
      layout = {
        dockbox: data
      };
    }
    if (!('dockbox' in layout)) {
      layout.dockbox = {mode: 'horizontal', children: [], size: 1};
    }
    if (!('floatbox' in layout)) {
      layout.floatbox = {mode: 'float', children: [], size: 1};
    } else {
      layout.floatbox.mode = 'float';
    }
    this.fixBoxData(layout.dockbox);
    this.fixBoxData(layout.floatbox);
    return layout;
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      layout: this.prepareInitData(props.defaultLayout),
      dropRect: null
    };
    document.addEventListener('dragend', this.dragEnd);
  }

  dragEnd = () => {
    if (this.state.dropRect) {
      this.setState({dropRect: null});
    }
  };

  setDropRect(element: HTMLElement, direction?: DropDirection) {
    let {dropRect} = this.state;
    if (dropRect && dropRect.element === element && dropRect.direction === direction) {
      return;
    }
    let layoutRect = this._ref.getBoundingClientRect();
    let scaleX = this._ref.offsetWidth / layoutRect.width;
    let scaleY = this._ref.offsetHeight / layoutRect.height;

    let elemRect = element.getBoundingClientRect();
    let left = (elemRect.left - layoutRect.left) * scaleX;
    let top = (elemRect.top - layoutRect.top) * scaleY;
    let width = elemRect.width * scaleX;
    let height = elemRect.height * scaleY;

    switch (direction) {
      case 'R':
        left += width * 0.7;
      case 'L': // tslint:disable-line no-switch-case-fall-through
        width *= 0.3;
        break;
      case 'B':
        top += height * 0.7;
      case 'T': // tslint:disable-line no-switch-case-fall-through
        height *= 0.3;
        break;
      case 'AfterTab':
        left += width - 8;
        width = 40;
        break;
      case 'BeforeTab':
        left -= 40 - 8;
        width = 40;
        break;
    }

    this.setState({dropRect: {left, top, width, height, element, direction}});
  }

  render(): React.ReactNode {
    let {style} = this.props;
    let {layout, dropRect} = this.state;
    let dropRectStyle: CSSProperties;
    if (dropRect) {
      let {element, direction, ...rect} = dropRect;
      dropRectStyle = {...rect, display: 'block'};
    }
    return (
      <div ref={this.getRef} className='dock-layout' style={style}>
        <DockContextProvider value={this}>
          <DockBox size={1} boxData={layout.dockbox}/>
          <FloatBox boxData={layout.floatbox}/>
        </DockContextProvider>
        <div className='dock-drop-indicator' style={dropRectStyle}/>
      </div>
    );
  }

  componentWillUnmount(): void {
    document.removeEventListener('dragend', this.dragEnd);
  }
}
