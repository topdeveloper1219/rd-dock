import React, {CSSProperties} from "react";
import {DockContextType, PanelData, TabData, TabGroup} from "./DockData";
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

  onDragOver = () => {
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

    }
  };

  onDragLeave() {
    if (this.state.dropFromPanel) {
      this.setState({dropFromPanel: null});
    }
  }

  _movingX: number;
  _movingY: number;
  onPanelHeaderDrag = (event: PointerEvent, initFunction: DragInitFunction) => {
    let {parent, x, y} = this.props.panelData;
    if (
      parent && parent.mode === 'float'
      && !(event.target as HTMLElement).draggable // dragging tab instead of panel
    ) {
      this._movingX = x;
      this._movingY = y;
      initFunction(this._ref.parentElement, this.onPanelHeaderDragMove);
    }
  };
  onPanelHeaderDragMove = (e: AbstractPointerEvent, dx: number, dy: number) => {
    let {panelData} = this.props;
    panelData.x = this._movingX + dx;
    panelData.y = this._movingY + dy;
    this.forceUpdate();
  };

  _movingW: number;
  _movingH: number;
  onPanelCornerDrag = (event: PointerEvent, initFunction: DragInitFunction) => {
    let {parent, w, h} = this.props.panelData;
    if (parent && parent.mode === 'float') {
      this._movingW = w;
      this._movingH = h;
      initFunction(this._ref, this.onPanelCornerDragMove);
    }
  };
  onPanelCornerDragMove = (e: AbstractPointerEvent, dx: number, dy: number) => {
    let {panelData} = this.props;
    panelData.w = this._movingW + dx;
    panelData.h = this._movingH + dy;
    this.forceUpdate();
  };


  render(): React.ReactNode {
    let {dropFromPanel} = this.state;
    let {panelData, size} = this.props;
    let {minWidth, minHeight, group, id, parent} = panelData;
    let {panelClass, headless} = group;
    let isFloat = parent && parent.mode === 'float';
    if (isFloat) {
      headless = false;
    }
    console.log(`panel render ${id}`);
    let cls = `dock-panel${headless ? ' dock-headless-panel' : ''} ${panelClass ? panelClass : ''}${dropFromPanel ? ' dock-panel-dropping' : ''}`;
    let style: React.CSSProperties = {minWidth, minHeight, flex: `1 1 ${size}px`};
    if (panelData.parent.mode === 'float') {
      style.left = panelData.x;
      style.top = panelData.y;
      style.width = panelData.w;
      style.height = panelData.h;
    }
    let droppingLayer: React.ReactNode;
    if (dropFromPanel) {
      droppingLayer = <DockDropLayer panelData={panelData} panelElement={this._ref} dropFromPanel={dropFromPanel}/>;
    }

    return (
      <div ref={this.getRef} className={cls} style={style} data-dockid={id}
           onDragOver={isFloat ? null : this.onDragOver}>
        <DockTabs panelData={panelData} onPanelHeaderDrag={this.onPanelHeaderDrag}/>
        {isFloat ?
          <DragInitiator className='dock-panel-drag-size' onDragInit={this.onPanelCornerDrag}/>
          : null
        }
        {droppingLayer}
      </div>
    );
  }
}
