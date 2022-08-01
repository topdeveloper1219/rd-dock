var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { DragDropDiv } from "./dragdrop/DragDropDiv";
import { DockContextType } from "./DockData";
/**
 * @return returns true if navigation is handled in local tab move, otherwise returns false
 */
function checkLocalTabMove(key, tabbar) {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        let tabs = Array.from(tabbar.querySelectorAll('.dock-tab-btn'));
        let activeTab = tabbar.querySelector('.dock-tab-active>.dock-tab-btn');
        let i = tabs.indexOf(activeTab);
        if (i >= 0) {
            if (key === 'ArrowLeft') {
                if (i > 0) {
                    tabs[i - 1].click();
                    tabs[i - 1].focus();
                    return true;
                }
            }
            else {
                if (i < tabs.length - 1) {
                    tabs[i + 1].click();
                    tabs[i + 1].focus();
                    return true;
                }
            }
        }
    }
    return false;
}
export function DockTabBar(props) {
    const { onDragStart, onDragMove, onDragEnd, TabNavList, isMaximized } = props, restProps = __rest(props, ["onDragStart", "onDragMove", "onDragEnd", "TabNavList", "isMaximized"]);
    const layout = React.useContext(DockContextType);
    const ref = React.useRef();
    const getRef = (div) => {
        ref.current = div;
    };
    const onKeyDown = (e) => {
        if (e.key.startsWith('Arrow')) {
            if (!checkLocalTabMove(e.key, ref.current) && !isMaximized) {
                layout.navigateToPanel(ref.current, e.key);
            }
            e.stopPropagation();
            e.preventDefault();
        }
    };
    return (React.createElement(DragDropDiv, { onDragStartT: onDragStart, onDragMoveT: onDragMove, onDragEndT: onDragEnd, role: "tablist", className: "dock-bar", onKeyDown: onKeyDown, getRef: getRef, tabIndex: -1 },
        React.createElement(TabNavList, Object.assign({}, restProps))));
}
