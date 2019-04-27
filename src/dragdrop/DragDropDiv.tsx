import React, {CSSProperties} from "react";
import * as DragManager from "./DragManager";

export type AbstractPointerEvent = MouseEvent | TouchEvent;

interface DragDropDivProps extends React.HTMLAttributes<HTMLDivElement> {
  getRef?: (ref: HTMLDivElement) => void;
  onDragStartT?: DragManager.DragHandler;
  onDragMoveT?: DragManager.DragHandler;
  onDragEndT?: DragManager.DragHandler;
  onDragOverT?: DragManager.DragHandler;
  onDragLeaveT?: DragManager.DragHandler;
  onDropT?: DragManager.DragHandler;
  /**
   * by default onDragStartT will be called on first drag move
   * but if directDragT is true, onDragStartT will be called as soon as mouse is down
   */
  directDragT?: boolean;
}

export class DragDropDiv extends React.Component<DragDropDivProps, any> {

  element: HTMLElement;

  _getRef = (r: HTMLDivElement) => {
    if (r === this.element) {
      return;
    }
    let {getRef, onDragOverT, onDropT, onDragLeaveT} = this.props;
    if (this.element && onDragOverT) {
      DragManager.removeHandlers(this.element);
    }
    this.element = r;
    if (getRef) {
      getRef(r);
    }
    if (r && onDragOverT) {
      DragManager.addHandlers(r, {onDragOverT, onDragLeaveT, onDropT});
    }
  };

  dragType: DragManager.DragType = null;
  baseX: number;
  baseY: number;
  scaleX: number;
  scaleY: number;
  waitingMove: boolean;

  onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!DragManager.checkPointerDownEvent(e.nativeEvent)) {
      // same pointer event shouldn't trigger 2 drag start
      return;
    }
    let state = new DragManager.DragState(e.nativeEvent, this, true);
    this.baseX = state.pageX;
    this.baseY = state.pageY;

    let baseElement = this.element.parentElement;
    let rect = baseElement.getBoundingClientRect();
    this.scaleX = baseElement.offsetWidth / Math.round(rect.width);
    this.scaleY = baseElement.offsetHeight / Math.round(rect.height);
    this.addListeners(e);
    if (this.props.directDragT) {
      let state = new DragManager.DragState(e.nativeEvent, this, true);
      this.executeFirstMove(state);
    }
  };

  addListeners(e: React.MouseEvent | React.TouchEvent) {
    let {onDragStartT} = this.props;

    if (this.dragType) {
      this.onEnd();
    }
    if (e.nativeEvent.type === 'touchstart') {
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchEnd);
      this.dragType = 'touch';
    } else {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseEnd);
      if ((e.nativeEvent as MouseEvent).button === 2) {
        this.dragType = 'right';
      } else {
        this.dragType = 'left';
      }
    }
    document.body.classList.add('dock-dragging');
    this.waitingMove = true;

  }

  // return true for a valid move
  checkFirstMove(e: AbstractPointerEvent) {
    let state = new DragManager.DragState(e, this, true);
    if (!state.moved()) {
      // not a move
      return false;
    }
    return this.executeFirstMove(state);
  }

  executeFirstMove(state: DragManager.DragState): boolean {
    let {onDragStartT} = this.props;

    this.waitingMove = false;
    onDragStartT(state);
    if (!DragManager.isDragging()) {
      this.onEnd();
      return false;
    }
    state.onMove();
    document.addEventListener('keydown', this.onKeyDown);
    return true;
  }


  onMouseMove = (e: MouseEvent) => {
    let {onDragMoveT} = this.props;
    if (this.waitingMove) {
      if (!this.checkFirstMove(e)) {
        return;
      }
    } else {
      let state = new DragManager.DragState(e, this);
      state.onMove();
      if (onDragMoveT) {
        onDragMoveT(state);
      }
    }
    e.preventDefault();
  };

  onMouseEnd = (e?: MouseEvent) => {
    let {onDragEndT} = this.props;
    let state = new DragManager.DragState(e, this);

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseEnd);
    this.cleanup(state);

    if (!this.waitingMove) {
      if (e) {
        state.onDrop();
      }
      if (onDragEndT) {
        onDragEndT(state);
      }
    }

    DragManager.destroyDraggingElement(state);
  };

  onTouchMove = (e: TouchEvent) => {
    let {onDragMoveT} = this.props;
    if (this.waitingMove) {
      if (!this.checkFirstMove(e)) {
        return;
      }
    } else if (e.touches.length !== 1) {
      this.onTouchEnd();
    } else {
      let state = new DragManager.DragState(e, this);
      state.onMove();
      if (onDragMoveT) {
        onDragMoveT(state);
      }
    }
    e.preventDefault();
  };
  onTouchEnd = (e?: TouchEvent) => {
    let {onDragEndT} = this.props;
    let state = new DragManager.DragState(e, this);

    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    this.cleanup(state);

    if (!this.waitingMove) {
      if (e) {
        state.onDrop();
      }
      if (onDragEndT) {
        onDragEndT(state);
      }
    }

    DragManager.destroyDraggingElement(state);
  };

  onKeyDown = (e?: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.onEnd();
    }
  };

  cleanup(e: DragManager.DragState) {
    this.dragType = null;
    this.waitingMove = false;
    document.body.classList.remove('dock-dragging');
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onEnd() {
    if (this.dragType === 'touch') {
      this.onTouchEnd();
    } else {
      this.onMouseEnd();
    }
  }

  render(): React.ReactNode {
    let {
      getRef, children, className,
      directDragT, onDragStartT, onDragMoveT, onDragEndT, onDragOverT, onDragLeaveT, onDropT,
      ...others
    } = this.props;
    let onPointerDown = this.onPointerDown;
    if (!onDragStartT) {
      onPointerDown = null;
    }
    if (onDragStartT) {
      if (className) {
        className = `${className} drag-initiator`;
      } else {
        className = 'drag-initiator';
      }
    }

    return (
      <div ref={this._getRef} className={className} {...others} onMouseDown={onPointerDown}
           onTouchStart={onPointerDown}>
        {children}
      </div>
    );
  }

  componentWillUnmount(): void {
    let {onDragOverT} = this.props;
    if (this.element && onDragOverT) {
      DragManager.removeHandlers(this.element);
    }
    if (this.dragType) {
      this.onEnd();
    }
  }
}