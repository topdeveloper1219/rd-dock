import React from "react";
import { PanelData, TabGroup } from "./DockData";
import { AbstractPointerEvent, DragInitFunction } from "./DragInitiator";
interface Props {
    panelData: PanelData;
    size: number;
}
interface State {
    dropping: TabGroup;
}
export declare class DockPanel extends React.PureComponent<Props, State> {
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    static _droppingPanel: DockPanel;
    static droppingPanel: DockPanel;
    state: State;
    onDragOver: () => void;
    onDragLeave(): void;
    _movingX: number;
    _movingY: number;
    onPanelHeaderDrag: (event: PointerEvent, initFunction: DragInitFunction) => void;
    onPanelHeaderDragMove: (e: AbstractPointerEvent, dx: number, dy: number) => void;
    render(): React.ReactNode;
}
export {};
