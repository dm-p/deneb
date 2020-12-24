/*
 *  Deneb: Declarative visualization in Power BI, using the Vega language.
 *
 *  Copyright (c) Daniel Marsh-Patrick
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

// External dependencies
import * as React from 'react';

// Internal dependencies
import { Debugger } from '../../Debugger';
import { VisualConfiguration } from '../../config';
import {
    EditorPane,
    MainInterfaceProps,
    MainInterfaceState,
    VisualRender,
    LandingPage
} from '..';
import { VisualState } from '../../api';

export class MainInterface extends React.Component<
    MainInterfaceProps,
    MainInterfaceState
> {
    constructor(props: MainInterfaceProps) {
        super(props);
        this.state = VisualConfiguration.stateDefaults.visualInterface;
    }

    render() {
        Debugger.LOG('Rendering component: [VisualInterface]');
        const { visualApi } = this.props,
            { isEditMode } = this.state;
        Debugger.LOG('Determining display conditions...');
        switch (true) {
            case visualApi.state === VisualState.Initial:
            case visualApi.state === VisualState.Landing: {
                Debugger.LOG('Landing page will be displayed.');
                return (
                    <>
                        <LandingPage visualApi={visualApi} />
                    </>
                );
            }
            case isEditMode: {
                Debugger.LOG('Advanced Editor will be displayed.');
                return (
                    <>
                        <EditorPane visualApi={visualApi} />
                    </>
                );
            }
            default: {
                Debugger.LOG('Standard visual display.');
                return (
                    <>
                        <VisualRender visualApi={visualApi} />
                    </>
                );
            }
        }
    }

    /**
     * Empty callback function - gets updated on mount.
     */
    private static updateCallback: (data: object) => void = null;

    /**
     * Allows setting of new state from the visual's update function
     * @param newState
     */
    public static UPDATE(newState: Partial<MainInterfaceState>) {
        if (typeof MainInterface.updateCallback === 'function') {
            MainInterface.updateCallback(newState);
        }
    }

    /**
     * Ensure that mount tasks are carried out.
     */
    public componentWillMount() {
        Debugger.LOG(`Mounted Component: [HtmlDisplayVisual]`);
        Debugger.LOG('Setting updateCallBack for passing state...');
        MainInterface.updateCallback = (newState: MainInterfaceState): void =>
            this.setState(newState);
    }

    /**
     * Ensure that unmount tasks are carried out.
     */
    public componentWillUnmount() {
        Debugger.LOG(`Unmounted Component: [HtmlDisplayVisual]`);
        Debugger.LOG('Removing updateCallBack...');
        MainInterface.updateCallback = null;
    }
}
