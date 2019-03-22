import React from "react";
import { DockContextType } from "./DockData";
import { DragStore } from "./DragStore";
export class DockDropSquare extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { dropping: false };
        this.onDragOver = (e) => {
            let { panelElement: targetElement, direction, depth } = this.props;
            this.setState({ dropping: true });
            for (let i = 0; i < depth; ++i) {
                targetElement = targetElement.parentElement;
            }
            this.context.setDropRect(targetElement, direction, this, e.nativeEvent);
            e.dataTransfer.dropEffect = 'move';
            e.preventDefault();
            e.stopPropagation();
        };
        this.onDragLeave = (e) => {
            let { panelElement, direction } = this.props;
            this.setState({ dropping: false });
            this.context.setDropRect(null, 'remove', this);
        };
        this.onDrop = (e) => {
            let tab = DragStore.getData(DockContextType, 'tab');
            if (tab) {
                let { panelData, direction, depth } = this.props;
                let target = panelData;
                for (let i = 0; i < depth; ++i) {
                    target = target.parent;
                }
                this.context.moveTab(tab, target, direction);
            }
        };
    }
    render() {
        let { direction, depth } = this.props;
        let { dropping } = this.state;
        let classes = ['dock-drop-square'];
        classes.push(`dock-drop-${direction}`);
        if (depth) {
            classes.push(`dock-drop-deep`);
        }
        if (dropping) {
            classes.push('dock-drop-square-dropping');
        }
        return (React.createElement("div", { className: classes.join(' '), onDragOver: this.onDragOver, onDragLeave: this.onDragLeave, onDrop: this.onDrop }));
    }
    componentWillUnmount() {
        this.context.setDropRect(null, 'remove', this);
    }
}
DockDropSquare.contextType = DockContextType;
export class DockDropLayer extends React.PureComponent {
    static addDepthSquare(children, mode, panelData, panelElement, depth) {
        if (mode === 'horizontal') {
            children.push(React.createElement(DockDropSquare, { key: `top${depth}`, direction: 'top', depth: depth, panelData: panelData, panelElement: panelElement }));
            children.push(React.createElement(DockDropSquare, { key: `bottom${depth}`, direction: 'bottom', depth: depth, panelData: panelData, panelElement: panelElement }));
        }
        else {
            children.push(React.createElement(DockDropSquare, { key: `left${depth}`, direction: 'left', depth: depth, panelData: panelData, panelElement: panelElement }));
            children.push(React.createElement(DockDropSquare, { key: `right${depth}`, direction: 'right', depth: depth, panelData: panelData, panelElement: panelElement }));
        }
    }
    render() {
        let { panelData, panelElement, dropFromPanel } = this.props;
        let children = [];
        DockDropLayer.addDepthSquare(children, 'horizontal', panelData, panelElement, 0);
        DockDropLayer.addDepthSquare(children, 'vertical', panelData, panelElement, 0);
        if (panelData.group === dropFromPanel.group && panelData !== dropFromPanel) {
            // dock to tabs
            children.push(React.createElement(DockDropSquare, { key: 'middle', direction: 'middle', panelData: panelData, panelElement: panelElement }));
        }
        if (dropFromPanel.group.floatable) {
            children.push(React.createElement(DockDropSquare, { key: 'float', direction: 'float', panelData: panelData, panelElement: panelElement }));
        }
        let box = panelData.parent;
        if (box && box.children.length > 1) {
            DockDropLayer.addDepthSquare(children, box.mode, panelData, panelElement, 1);
            if (box.parent) {
                DockDropLayer.addDepthSquare(children, box.parent.mode, panelData, panelElement, 2);
            }
        }
        return (React.createElement("div", { className: 'dock-drop-layer' }, children));
    }
}
//# sourceMappingURL=DockDropLayer.js.map