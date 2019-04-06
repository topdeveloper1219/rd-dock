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

  dragging: boolean = false;
  isTouch: boolean = false;
  baseX: number;
  baseY: number;
  scaleX: number;
  scaleY: number;
  waitingMove: boolean;

  onPointerDown = (e: React.PointerEvent) => {
    this.baseX = e.pageX;
    this.baseY = e.pageY;

    let rect = this.element.getBoundingClientRect();
    this.scaleX = this.element.offsetWidth / rect.width;
    this.scaleY = this.element.offsetHeight / rect.height;
    this.addListeners(e);
  };

  addListeners(e: React.PointerEvent) {
    let {onDragStartT} = this.props;

    if (this.dragging) {
      this.onEnd();
    }
    if (e.pointerType === 'touch') {
      this.isTouch = true;
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchEnd);
    } else {
      this.isTouch = false;
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseEnd);
    }

    this.waitingMove = true;
    this.dragging = true;
    e.stopPropagation();
  }

  // return true
  checkFirstMove(e: AbstractPointerEvent) {
    let {onDragStartT} = this.props;

    let state = new DragManager.DragState(e, this, true);
    if (state.dx === 0 && state.dy === 0) {
      console.log(state);
      // not a move
      return false;
    }
    this.waitingMove = false;
    onDragStartT(state);
    if (!DragManager.isDragging()) {
      this.onEnd();
      return false;
    }
    state.moved();
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
      if (onDragMoveT) {
        onDragMoveT(state);
      }
      state.moved();
    }
    e.preventDefault();
  };

  onMouseEnd = (e?: MouseEvent) => {
    let {onDragEndT} = this.props;
    let state = new DragManager.DragState(e, this);
    if (onDragEndT) {
      onDragEndT(state);
    }
    state.dropped();

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseEnd);
    this.cleanup();
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
      if (onDragMoveT) {
        onDragMoveT(state);
      }
      state.moved();
    }
    e.preventDefault();
  };
  onTouchEnd = (e?: TouchEvent) => {
    let {onDragEndT} = this.props;
    let state = new DragManager.DragState(e, this);
    if (onDragEndT) {
      onDragEndT(state);
    }
    state.dropped();
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    this.cleanup();

  };

  onKeyDown = (e?: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.onEnd();
    }
  };

  cleanup() {
    this.dragging = false;
    this.waitingMove = false;
    document.removeEventListener('keydown', this.onKeyDown);
    DragManager.destroyDraggingElement();
  }

  onEnd() {
    if (this.isTouch) {
      this.onTouchEnd();
    } else {
      this.onMouseEnd();
    }
  }

  render(): React.ReactNode {
    let {children, onDragStartT, onDragMoveT, onDragEndT, onDragOverT, onDragLeaveT, onDropT, ...others} = this.props;
    let onPointerDown = this.onPointerDown;
    if (!onDragStartT) {
      onPointerDown = null;
    }
    return (
      <div ref={this._getRef} {...others} onPointerDown={this.onPointerDown}>
        {children}
      </div>
    );
  }

  componentWillUnmount(): void {
    if (this.dragging) {
      this.onEnd();
    }
  }
}