import React, {CSSProperties, PointerEventHandler} from "react";
import {DockContext, DockContextType, DockMode, PanelData, TabData, TabGroup} from "./DockData";
import {DockTabs} from "./DockTabs";
import {AbstractPointerEvent, DragInitFunction, DragInitiator} from "./DragInitiator";
import {DragStore} from "./DragStore";
import {DockDropLayer} from "./DockDropLayer";

interface Props {
  panelData: PanelData;
  size: number;
}

interface State {
  dropFromPanel: PanelData;

}

export class DockPanel extends React.PureComponent<Props, State> {
  static contextType = DockContextType;

  context!: DockContext;

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };

  static _droppingPanel: DockPanel;
  static set droppingPanel(panel: DockPanel) {
    if (DockPanel._droppingPanel === panel) {
      return;
    }
    if (DockPanel._droppingPanel) {
      DockPanel._droppingPanel.onDragLeave();
    }
    DockPanel._droppingPanel = panel;
  }

  state: State = {dropFromPanel: null};

  onDragEnter = () => {
    let {panelData} = this.props;
    DockPanel.droppingPanel = this;
    let tab: TabData = DragStore.getData(DockContextType, 'tab');
    let panel: PanelData = DragStore.getData(DockContextType, 'panel');
    if (tab) {
      if (tab.parent) {
        this.setState({dropFromPanel: tab.parent});
      } else {
        // add a fake panel
        this.setState({dropFromPanel: {activeId: '', tabs: [], group: tab.group}});
      }
    } else if (panel) {
      this.setState({dropFromPanel: panel});
    }
  };

  onDragLeave() {
    if (this.state.dropFromPanel) {
      this.setState({dropFromPanel: null});
    }
  }

  // used both by dragging head and corner
  _movingX: number;
  _movingY: number;
  // drop to move in float mode
  onPanelHeaderDragInit = (event: PointerEvent, initFunction: DragInitFunction) => {
    let {panelData} = this.props;
    let {parent, x, y, z} = panelData;
    if (
      parent && parent.mode === 'float'
      && !(event.target as HTMLElement).draggable // dragging tab instead of panel
    ) {
      this._movingX = x;
      this._movingY = y;
      initFunction(this._ref.parentElement, this.onPanelHeaderDragMove);
      this.onFloatPointerDown();
    }
  };
  onPanelHeaderDragMove = (e: AbstractPointerEvent, dx: number, dy: number) => {
    let {panelData} = this.props;
    panelData.x = this._movingX + dx;
    panelData.y = this._movingY + dy;
    this.forceUpdate();
  };

  // drag in dock mode
  onPanelHeaderHtmlDrag = (event: React.DragEvent) => {
    DragStore.dragStart(DockContextType, {panel: this.props.panelData}, event.nativeEvent, this._ref);
    event.stopPropagation();
  };

  _movingW: number;
  _movingH: number;
  _movingCorner: string;
  onPanelCornerDragTL = (event: PointerEvent, initFunction: DragInitFunction) => {
    this.onPanelCornerDrag(event, initFunction, 'tl');
  };
  onPanelCornerDragTR = (event: PointerEvent, initFunction: DragInitFunction) => {
    this.onPanelCornerDrag(event, initFunction, 'tr');
  };
  onPanelCornerDragBL = (event: PointerEvent, initFunction: DragInitFunction) => {
    this.onPanelCornerDrag(event, initFunction, 'bl');
  };
  onPanelCornerDragBR = (event: PointerEvent, initFunction: DragInitFunction) => {
    this.onPanelCornerDrag(event, initFunction, 'br');
  };

  onPanelCornerDrag(event: PointerEvent, initFunction: DragInitFunction, corner: string) {
    let {parent, x, y, w, h} = this.props.panelData;
    if (parent && parent.mode === 'float') {
      this._movingCorner = corner;
      this._movingX = x;
      this._movingY = y;
      this._movingW = w;
      this._movingH = h;
      initFunction(this._ref, this.onPanelCornerDragMove);
    }
  }

  onPanelCornerDragMove = (e: AbstractPointerEvent, dx: number, dy: number) => {
    let {panelData} = this.props;
    switch (this._movingCorner) {
      case 'tl': {
        panelData.x = this._movingX + dx;
        panelData.w = this._movingW - dx;
        panelData.y = this._movingY + dy;
        panelData.h = this._movingH - dy;
        break;
      }
      case 'tr': {
        panelData.w = this._movingW + dx;
        panelData.y = this._movingY + dy;
        panelData.h = this._movingH - dy;
        break;
      }
      case 'bl': {
        panelData.x = this._movingX + dx;
        panelData.w = this._movingW - dx;
        panelData.h = this._movingH + dy;
        break;
      }
      case 'br': {
        panelData.w = this._movingW + dx;
        panelData.h = this._movingH + dy;
        break;
      }
    }

    this.forceUpdate();
  };

  onFloatPointerDown = () => {
    let {panelData} = this.props;
    let {z} = panelData;
    let newZ = this.context.nextFloatZIndex(z);
    if (newZ !== z) {
      panelData.z = newZ;
      this.forceUpdate();
    }
  };


  render(): React.ReactNode {
    let {dropFromPanel} = this.state;
    let {panelData, size} = this.props;
    let {minWidth, minHeight, group: groupName, id, parent, panelLock} = panelData;

    if (panelLock) {
      if (panelLock.panelStyle) {
        groupName = panelLock.panelStyle;
      }
    }
    let panelClass: string;
    if (groupName) {
      panelClass = groupName
        .split(' ')
        .map((name) => `dock-style-${name}`)
        .join(' ');
    }

    let isFloat = parent && parent.mode === 'float';
    let pointerDownCallback: React.PointerEventHandler;
    if (isFloat) {
      pointerDownCallback = this.onFloatPointerDown;
    }
    let cls = `dock-panel ${panelClass ? panelClass : ''}${dropFromPanel ? ' dock-panel-dropping' : ''}`;
    let style: React.CSSProperties = {minWidth, minHeight, flex: `${size} 1 ${size}px`};
    if (panelData.parent.mode === 'float') {
      style.left = panelData.x;
      style.top = panelData.y;
      style.width = panelData.w;
      style.height = panelData.h;
      style.zIndex = panelData.z;
    }
    let droppingLayer: React.ReactNode;
    if (dropFromPanel) {
      droppingLayer = <DockDropLayer panelData={panelData} panelElement={this._ref} dropFromPanel={dropFromPanel}/>;
    }

    let onPanelHeaderDragInit = this.onPanelHeaderDragInit;
    let onPanelHeaderHtmlDrag = this.onPanelHeaderHtmlDrag;
    if (isFloat) {
      onPanelHeaderHtmlDrag = null;
    } else {
      onPanelHeaderDragInit = null;
    }

    console.log(`panel render ${id} ${cls}`);
    console.log(panelData)

    return (
      <div ref={this.getRef} className={cls} style={style} data-dockid={id}
           onPointerDown={pointerDownCallback} onDragEnter={isFloat ? null : this.onDragEnter}>
        <DockTabs panelData={panelData} onPanelHeaderDragInit={onPanelHeaderDragInit}
                  onPanelHeaderHtmlDrag={onPanelHeaderHtmlDrag}/>
        {isFloat ?
          [
            <DragInitiator key='drag-size-t-l' className='dock-panel-drag-size dock-panel-drag-size-t-l'
                           onDragInit={this.onPanelCornerDragTL}/>,
            <DragInitiator key='drag-size-t-r' className='dock-panel-drag-size dock-panel-drag-size-t-r'
                           onDragInit={this.onPanelCornerDragTR}/>,
            <DragInitiator key='drag-size-b-l' className='dock-panel-drag-size dock-panel-drag-size-b-l'
                           onDragInit={this.onPanelCornerDragBL}/>,
            <DragInitiator key='drag-size-b-r' className='dock-panel-drag-size dock-panel-drag-size-b-r'
                           onDragInit={this.onPanelCornerDragBR}/>
          ]
          : null
        }
        {droppingLayer}
      </div>
    );
  }
}
