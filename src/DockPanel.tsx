import React, {CSSProperties, PointerEventHandler} from "react";
import {DockContext, DockContextType, DockMode, PanelData, TabData, TabGroup} from "./DockData";
import {DockTabs} from "./DockTabs";
import {AbstractPointerEvent, DragDropDiv} from "./dragdrop/DragDropDiv";
import {DragState} from "./dragdrop/DragManager";
import {DockDropLayer} from "./DockDropLayer";
import {nextZIndex} from "./Algorithm";

interface Props {
  panelData: PanelData;
  size: number;
}

interface State {
  dropFromPanel: PanelData;
  draggingHeader: boolean;
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

  state: State = {dropFromPanel: null, draggingHeader: false};

  onDragOver = (e: DragState) => {
    if (DockPanel._droppingPanel === this) {
      return;
    }
    let {panelData} = this.props;
    DockPanel.droppingPanel = this;
    let tab: TabData = DragState.getData('tab', DockContextType);
    let panel: PanelData = DragState.getData('panel', DockContextType);
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
  onPanelHeaderDragStart = (event: DragState) => {
    let {panelData} = this.props;
    let {parent, x, y, z} = panelData;
    if (parent && parent.mode === 'float') {
      this._movingX = x;
      this._movingY = y;
      // hide the panel, but not create drag layer element
      event.startDrag(null, null);
      event.setData({panel: this.props.panelData}, DockContextType);
      this.onFloatPointerDown();
    } else {
      event.startDrag(null);
      event.setData({panel: this.props.panelData}, DockContextType);
    }
    this.setState({draggingHeader: true});
  };
  onPanelHeaderDragMove = (e: DragState) => {
    let {panelData} = this.props;
    panelData.x = this._movingX + e.dx;
    panelData.y = this._movingY + e.dy;
    this.forceUpdate();
  };
  onPanelHeaderDragEnd = (e: DragState) => {
    this.setState({draggingHeader: false});
  };


  _movingW: number;
  _movingH: number;
  _movingCorner: string;
  onPanelCornerDragTL = (e: DragState) => {
    this.onPanelCornerDrag(e, 'tl');
  };
  onPanelCornerDragTR = (e: DragState) => {
    this.onPanelCornerDrag(e, 'tr');
  };
  onPanelCornerDragBL = (e: DragState) => {
    this.onPanelCornerDrag(e, 'bl');
  };
  onPanelCornerDragBR = (e: DragState) => {
    this.onPanelCornerDrag(e, 'br');
  };

  onPanelCornerDrag(e: DragState, corner: string) {
    let {parent, x, y, w, h} = this.props.panelData;
    if (parent && parent.mode === 'float') {
      this._movingCorner = corner;
      this._movingX = x;
      this._movingY = y;
      this._movingW = w;
      this._movingH = h;
      e.startDrag(null, null);
    }
  }

  onPanelCornerDragMove = (e: DragState) => {
    let {panelData} = this.props;
    switch (this._movingCorner) {
      case 'tl': {
        panelData.x = this._movingX + e.dx;
        panelData.w = this._movingW - e.dx;
        panelData.y = this._movingY + e.dy;
        panelData.h = this._movingH - e.dy;
        break;
      }
      case 'tr': {
        panelData.w = this._movingW + e.dx;
        panelData.y = this._movingY + e.dy;
        panelData.h = this._movingH - e.dy;
        break;
      }
      case 'bl': {
        panelData.x = this._movingX + e.dx;
        panelData.w = this._movingW - e.dx;
        panelData.h = this._movingH + e.dy;
        break;
      }
      case 'br': {
        panelData.w = this._movingW + e.dx;
        panelData.h = this._movingH + e.dy;
        break;
      }
    }

    this.forceUpdate();
  };

  onFloatPointerDown = () => {
    let {panelData} = this.props;
    let {z} = panelData;
    let newZ = nextZIndex(z);
    if (newZ !== z) {
      panelData.z = newZ;
      this.forceUpdate();
    }
  };


  render(): React.ReactNode {
    let {dropFromPanel, draggingHeader} = this.state;
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
    let cls = `dock-panel ${
      panelClass ? panelClass : ''}${
      dropFromPanel ? ' dock-panel-dropping' : ''}${
      draggingHeader ? ' dragging' : ''
      }`;
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


    return (
      <DragDropDiv getRef={this.getRef} className={cls} style={style} data-dockid={id}
                   onPointerDown={pointerDownCallback} onDragOverT={isFloat ? null : this.onDragOver}>
        <DockTabs panelData={panelData} onPanelDragStart={this.onPanelHeaderDragStart}
                  onPanelDragMove={this.onPanelHeaderDragMove} onPanelDragEnd={this.onPanelHeaderDragEnd}/>
        {isFloat ?
          [
            <DragDropDiv key='drag-size-t-l' className='dock-panel-drag-size dock-panel-drag-size-t-l'
                         onDragStartT={this.onPanelCornerDragTL} onDragMoveT={this.onPanelCornerDragMove}/>,
            <DragDropDiv key='drag-size-t-r' className='dock-panel-drag-size dock-panel-drag-size-t-r'
                         onDragStartT={this.onPanelCornerDragTR} onDragMoveT={this.onPanelCornerDragMove}/>,
            <DragDropDiv key='drag-size-b-l' className='dock-panel-drag-size dock-panel-drag-size-b-l'
                         onDragStartT={this.onPanelCornerDragBL} onDragMoveT={this.onPanelCornerDragMove}/>,
            <DragDropDiv key='drag-size-b-r' className='dock-panel-drag-size dock-panel-drag-size-b-r'
                         onDragStartT={this.onPanelCornerDragBR} onDragMoveT={this.onPanelCornerDragMove}/>
          ]
          : null
        }
        {droppingLayer}
      </DragDropDiv>
    );
  }
}
