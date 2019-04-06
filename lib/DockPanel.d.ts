import React from "react";
import { DockContext, PanelData } from "./DockData";
import { AbstractPointerEvent, DragInitFunction } from "./dragdrop/DragDropDiv";
interface Props {
    panelData: PanelData;
    size: number;
}
interface State {
    dropFromPanel: PanelData;
}
export declare class DockPanel extends React.PureComponent<Props, State> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    static _droppingPanel: DockPanel;
    static droppingPanel: DockPanel;
    state: State;
    onDragEnter: () => void;
    onDragLeave(): void;
    _movingX: number;
    _movingY: number;
    onPanelHeaderDragInit: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelHeaderDragMove: (e: AbstractPointerEvent, dx: number, dy: number) => void;
    onPanelHeaderHtmlDrag: (event: React.DragEvent<Element>) => void;
    _movingW: number;
    _movingH: number;
    _movingCorner: string;
    onPanelCornerDragTL: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelCornerDragTR: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelCornerDragBL: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelCornerDragBR: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelCornerDrag(event: PointerEvent, initFunction: DragInitFunction, corner: string): void;
    onPanelCornerDragMove: (e: AbstractPointerEvent, dx: number, dy: number) => void;
    onFloatPointerDown: () => void;
    render(): React.ReactNode;
}
export {};
