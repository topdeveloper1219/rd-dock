import React, {CSSProperties} from "react";
import debounce from 'lodash/debounce';
import {
  BoxData,
  LayoutData,
  PanelData,
  DockContextProvider,
  DockContext,
  DropDirection,
  TabData,
  TabGroup,
  placeHolderStyle,
  placeHolderGroup,
  defaultGroup,
  LayoutBase,
  TabBase,
  PanelBase
} from "./DockData";
import {DockBox} from "./DockBox";
import {FloatBox} from "./FloatBox";
import {DockPanel} from "./DockPanel";
import * as Algorithm from "./Algorithm";
import * as Serializer from "./Serializer";
import * as DragManager from "./dragdrop/DragManager";

interface LayoutProps {
  /**
   * - when [[LayoutProps.loadTab]] callback is defined, tabs in defaultLayout only need to have an id, unless loadTab requires other fields
   * - when [[LayoutProps.loadTab]] is not defined, tabs must contain title and content, as well as other fields in [[TabData]] when needed
   */
  defaultLayout: LayoutData;

  /**
   * set layout only when you want to use DockLayout as a fully controlled react component
   * when using controlled layout, [[LayoutProps.onChange]] must be set to enable any layout change
   */
  layout?: LayoutBase;

  /**
   * Tab Groups, defines additional configuration for different groups
   */
  groups?: {[key: string]: TabGroup};

  /**
   * @param newLayout layout data can be set to [[LayoutProps.layout]] directly when used as controlled component
   */
  onLayoutChange?(newLayout: LayoutBase): void;

  /**
   * - default mode: showing 4 to 9 squares to help picking drop areas
   * - edge mode: using the distance between mouse and panel border to pick drop area
   *   - in edge mode, dragging float panel's header won't bring panel back to dock layer
   */
  dropMode?: 'default' | 'edge';

  /**
   * override the default saveTab behavior
   * @return must have an unique id
   */
  saveTab?(tab: TabData): TabBase;

  /**
   * override the default loadTab behavior
   * - when loadTab is null, [[LayoutProps.defaultLayout]] must contain the titles and contents for TabData
   * - when loadTab is specified, [[LayoutProps.defaultLayout]] can ignore all those and only keep id and other custom data
   */
  loadTab?(tab: TabBase): TabData;

  /**
   * modify the savedPanel, you can add additional data into the savedPanel
   */
  afterPanelSaved?(savedPanel: PanelBase, panel: PanelData): void;

  /**
   * modify the loadedPanel, you can retrieve additional data into the panel
   * - modifying panel tabs is allowed, make sure to add or replace full TabData, because loadTab won't be called after this
   * - when handling panel with panelLock, make sure also set the group
   */
  afterPanelLoaded?(savedPanel: PanelBase, loadedPanel: PanelData): void;

  style?: CSSProperties;
}

interface LayoutState {
  layout: LayoutData;
  /** @ignore
   * keep the last loaded layout to prevent unnecessary reloading
   */
  loadedFrom?: LayoutBase;
  /** @ignore */
  dropRect?: {left: number, width: number, top: number, height: number, element: HTMLElement, source?: any, direction?: DropDirection};
}

export class DockLayout extends React.PureComponent<LayoutProps, LayoutState> implements DockContext {
  /** @ignore */
  _ref: HTMLDivElement;
  /** @ignore */
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };

  /** @ignore */
  prepareInitData(data: LayoutData): LayoutData {
    let layout = {...data};
    Algorithm.fixLayoutData(layout, this.props.loadTab);
    return layout;
  }

  /** @inheritDoc */
  getGroup(name: string) {
    if (name) {
      let {groups} = this.props;
      if (groups && name in groups) {
        return groups[name];
      }
      if (name === placeHolderStyle) {
        return placeHolderGroup;
      }
    }
    return defaultGroup;
  }

  /**
   * @inheritDoc
   * @param source @inheritDoc
   * @param target @inheritDoc
   * @param direction @inheritDoc
   */
  dockMove(source: TabData | PanelData, target: TabData | PanelData | BoxData, direction: DropDirection) {
    let {layout} = this.state;

    layout = Algorithm.removeFromLayout(layout, source);

    target = Algorithm.getUpdatedObject(target); // target might change during removeTab

    if (direction === 'float') {
      let newPanel = Algorithm.converToPanel(source);
      newPanel.z = Algorithm.nextZIndex(null);
      layout = Algorithm.floatPanel(layout, newPanel, this.state.dropRect);
    } else if (target) {
      if ('tabs' in target) {
        // pandel target
        if (direction === 'middle') {
          layout = Algorithm.addTabToPanel(layout, source, target);
        } else {
          let newPanel = Algorithm.converToPanel(source);
          layout = Algorithm.dockPanelToPanel(layout, newPanel, target, direction);
        }

      } else if ('children' in target) {
        // box target
        let newPanel = Algorithm.converToPanel(source);
        layout = Algorithm.dockPanelToBox(layout, newPanel, target, direction);
      } else {
        // tab target
        layout = Algorithm.addNextToTab(layout, source, target, direction);
      }
    }
    layout = Algorithm.fixLayoutData(layout);
    this.changeLayout(layout);
    this.dragEnd();
  }

  /** @inheritDoc */
  find(id: string): PanelData | TabData {
    return Algorithm.find(this.state.layout, id);
  }

  /** @ignore */
  getLayoutSize() {
    if (this._ref) {
      return {width: this._ref.offsetWidth, height: this._ref.offsetHeight};
    }
    return {width: 0, height: 0};
  }

  /** @inheritDoc */
  updateTab(id: string, newTab: TabData): boolean {
    let tab = this.find(id);
    if (tab && !('tabs' in tab)) {
      let panelData = tab.parent;
      let idx = panelData.tabs.indexOf(tab);
      if (idx >= 0) {
        let {loadTab} = this.props;
        if (loadTab && !('content' in newTab && 'title' in newTab)) {
          newTab = loadTab(newTab);
        }
        let {layout} = this.state;
        layout = Algorithm.removeFromLayout(layout, tab); // remove old tab
        panelData = Algorithm.getUpdatedObject(panelData); // panelData might change during removeTab
        layout = Algorithm.addTabToPanel(layout, newTab, panelData, idx); // add new tab
        layout = Algorithm.fixLayoutData(layout);
        this.setState({layout});
        return true;
      }
    }
    return false;
  }

  constructor(props: LayoutProps) {
    super(props);
    let {layout, defaultLayout} = props;
    let preparedLayout = this.prepareInitData(props.defaultLayout);
    if (layout) {
      // controlled layout
      this.state = {
        loadedFrom: layout,
        layout: DockLayout.loadLayoutData(layout, props),
        dropRect: null
      };
    } else {
      this.state = {
        layout: preparedLayout,
        dropRect: null
      };
    }

    DragManager.addDragEndListener(this.dragEnd);
    window.addEventListener('resize', this.onWindowResize);
  }

  /** @ignore */
  dragEnd = () => {
    DockPanel.droppingPanel = null;
    if (this.state.dropRect) {
      this.setState({dropRect: null});
    }
  };

  /** @ignore */
  useEdgeDrop() {
    return this.props.dropMode === 'edge';
  }

  /** @ignore */
  setDropRect(element: HTMLElement, direction?: DropDirection, source?: any, event?: {clientX: number, clientY: number}) {
    let {dropRect} = this.state;
    if (dropRect) {
      if (direction === 'remove') {
        if (dropRect.source === source) {
          this.setState({dropRect: null});
        }
        return;
      } else if (dropRect.element === element && dropRect.direction === direction && direction !== 'float') {
        // skip duplicated update except for float dragging
        return;
      }
    }
    if (!element) {
      this.setState({dropRect: null});
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

    let ratio = 0.5;
    if (element.classList.contains('dock-box')) {
      ratio = 0.3;
    }
    switch (direction) {
      case 'float': {
        let x = (event.clientX - layoutRect.left) * scaleX;
        let y = (event.clientY - layoutRect.top) * scaleY;
        left = x - 150;
        top = y - 15;
        width = 300;
        height = 300;
        break;
      }
      case 'right':
        left += width * (1 - ratio);
      case 'left': // tslint:disable-line no-switch-case-fall-through
        width *= ratio;
        break;
      case 'bottom':
        top += height * (1 - ratio);
      case 'top': // tslint:disable-line no-switch-case-fall-through
        height *= ratio;
        break;
      case 'after-tab':
        left += width - 15;
        width = 30;
        break;
      case 'before-tab':
        left -= 15;
        width = 30;
        break;
    }

    this.setState({dropRect: {left, top, width, height, element, source, direction}});
  }

  /** @ignore */
  render(): React.ReactNode {
    let {style} = this.props;
    let {layout, dropRect} = this.state;
    let dropRectStyle: CSSProperties;
    if (dropRect) {
      let {element, direction, ...rect} = dropRect;
      dropRectStyle = {...rect, display: 'block'};
      if (direction === 'float') {
        dropRectStyle.transition = 'none';
      }
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

  onWindowResize = debounce(() => {
    let layout = this.state.layout;
    let newLayout = Algorithm.fixFloatPanelPos(layout, this._ref.offsetWidth, this._ref.offsetHeight);
    if (layout !== newLayout) {
      newLayout = Algorithm.fixLayoutData(newLayout); // panel parent might need a fix
      this.changeLayout(newLayout);
    }
  }, 200);

  /** @ignore */
  componentWillUnmount(): void {
    window.removeEventListener('resize', this.onWindowResize);
    DragManager.removeDragEndListener(this.dragEnd);
    this.onWindowResize.cancel();
  }

  /** @ignore
   * change layout
   */
  changeLayout(layoutData: LayoutData) {
    let {layout, onLayoutChange} = this.props;
    let savedLayout: LayoutBase;
    if (onLayoutChange) {
      savedLayout = Serializer.saveLayoutData(this.state.layout, this.props.saveTab, this.props.afterPanelSaved);
      onLayoutChange(savedLayout);
    }
    if (!layout) {
      // uncontrolled layout when Props.layout is null
      this.setState({layout: layoutData, loadedFrom: savedLayout});
    }
  }

  // public api

  saveLayout(): LayoutBase {
    return Serializer.saveLayoutData(this.state.layout, this.props.saveTab, this.props.afterPanelSaved);
  }

  /**
   * load layout
   * calling this api won't trigger the [[LayoutProps.onLayoutChange]] callback
   */
  loadLayout(savedLayout: LayoutBase) {
    let {defaultLayout, loadTab, afterPanelLoaded} = this.props;
    this.setState({layout: DockLayout.loadLayoutData(savedLayout, this.props, this._ref.offsetWidth, this._ref.offsetHeight)});
  }

  /** @ignore */
  static loadLayoutData(savedLayout: LayoutBase, props: LayoutProps, width = 0, height = 0): LayoutData {
    let {defaultLayout, loadTab, afterPanelLoaded} = props;
    let layout = Serializer.loadLayoutData(
      savedLayout,
      defaultLayout,
      loadTab,
      afterPanelLoaded
    );

    layout = Algorithm.fixFloatPanelPos(layout, width, height);
    layout = Algorithm.fixLayoutData(layout);
    return layout;
  }

  static getDerivedStateFromProps(props: LayoutProps, state: LayoutState) {
    let {layout} = props;
    let {loadedFrom} = state;
    if (layout && layout !== loadedFrom) {
      // auto reload on layout prop change
      return {
        layout: DockLayout.loadLayoutData(layout, props),
        loadedLayout: layout
      };
    }
    return null;
  }
}
