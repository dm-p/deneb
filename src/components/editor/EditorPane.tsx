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
import SplitPane from 'react-split-pane';
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';

// Internal dependencies
import { Debugger } from '../../Debugger';
import {
    EditorPaneProps,
    Editor,
    EditorPaneState,
    SpecPersistenceCommands,
    VisualRender
} from '..';
import { VisualConfiguration } from '../../config';

export class EditorPane extends React.Component<
    EditorPaneProps,
    EditorPaneState
> {
    constructor(props: EditorPaneProps) {
        super(props);
        const width = this.getDefaultPaneWidthInPx();
        this.props.visualServices.editorPaneWidth = width;
        this.state = {
            width: width,
            expandedWidth: width,
            isExpanded: true,
            isDirty: false
        };
        this.handleResize = this.handleResize.bind(this);
        this.handlePaneToggle = this.handlePaneToggle.bind(this);
        this.resolveMinSize = this.resolveMinSize.bind(this);
        this.resolveMaxSize = this.resolveMaxSize.bind(this);
        this.resolveDefaultSize = this.resolveDefaultSize.bind(this);
        this.resolveDoubleClick = this.resolveDoubleClick.bind(this);
        this.resolveDirtyFlag = this.resolveDirtyFlag.bind(this);
    }

    render() {
        Debugger.LOG('Rendering Component: [VisualEditorPane]...');
        const { visualServices } = this.props,
            { isExpanded } = this.state;
        return (
            <div id='visualEditor'>
                <SplitPane
                    split='vertical'
                    minSize={this.resolveMinSize(isExpanded)}
                    maxSize={this.resolveMaxSize(isExpanded)}
                    size={this.resolveDefaultSize(isExpanded)}
                    onChange={this.handleResize}
                    onResizerDoubleClick={this.resolveDoubleClick}
                    allowResize={isExpanded}
                >
                    <section>{this.resolvePaneContent()}</section>
                    <div id='editorPreview'>
                        {<VisualRender visualServices={visualServices} />}
                    </div>
                </SplitPane>
            </div>
        );
    }

    private resolveDirtyFlag() {
        Debugger.LOG('EditorPane.resolveDirtyFlag()');
        const { visualServices } = this.props,
            { editor, settings } = visualServices;
        editor.resolveDirtyStatus(settings.vega.jsonSpec);
        Debugger.LOG(`Dirty = ${editor.isDirty}`);
        this.setState({
            isDirty: editor.isDirty
        });
    }

    private resolvePaneContent() {
        const { visualServices } = this.props,
            { localisationManager } = visualServices,
            { isExpanded } = this.state;
        switch (isExpanded) {
            case true: {
                Debugger.LOG('Pane is expanded. Returning all content...');
                return (
                    <>
                        <div id='editorPane' className='w3-panel expanded'>
                            <section>
                                <header>
                                    <div
                                        role='button'
                                        className='editor-heading'
                                        onClick={this.handlePaneToggle}
                                    >
                                        {localisationManager.getDisplayName(
                                            'Editor_Heading'
                                        )}
                                    </div>
                                    <div
                                        role='button'
                                        className='editor-collapse'
                                        onClick={this.handlePaneToggle}
                                    >
                                        <CgChevronLeft />
                                    </div>
                                    <div className='text-muted assistive small'>
                                        {localisationManager.getDisplayName(
                                            'Editor_Assistive'
                                        )}
                                    </div>
                                </header>
                                <Editor
                                    visualServices={visualServices}
                                    resolveDirtyFlag={this.resolveDirtyFlag}
                                />
                                <footer>
                                    <SpecPersistenceCommands
                                        visualServices={visualServices}
                                    />
                                </footer>
                            </section>
                        </div>
                    </>
                );
            }
            case false: {
                Debugger.LOG('Pane is collapsed. Returning minimal content...');
                return (
                    <>
                        <div id='editorPane' className='collapsed'>
                            <div
                                role='button'
                                className='editor-expand'
                                onClick={this.handlePaneToggle}
                            >
                                <CgChevronRight />
                            </div>
                            <div
                                role='button'
                                className='editor-heading'
                                onClick={this.handlePaneToggle}
                            >
                                {localisationManager.getDisplayName(
                                    'Editor_Heading'
                                )}
                            </div>
                        </div>
                    </>
                );
            }
        }
    }

    private resolveDoubleClick(event: MouseEvent) {
        Debugger.LOG('EditorPane.resolveDoubleClick()');
        Debugger.LOG('Resizer double-clicked!');
        event.preventDefault();
        this.resetPaneToDefaultWidth();
    }

    private getDefaultPaneWidthInPx() {
        return (
            this.props.visualServices.viewport.width *
            VisualConfiguration.splitPane.defaultSizePercent
        );
    }

    private resetPaneToDefaultWidth() {
        Debugger.LOG('EditorPane.resetPaneToDefaultWidth()');
        const { isExpanded } = this.state,
            width = this.getDefaultPaneWidthInPx();
        if (isExpanded) {
            Debugger.LOG(`Resetting pane to default - ${width}px...`);
            this.setPaneWidth(width);
        }
    }

    private resolveMinSize(isExpanded: boolean) {
        const { minSize, collapsedSize } = VisualConfiguration.splitPane;
        return (isExpanded && minSize) || collapsedSize;
    }

    private resolveMaxSize(isExpanded: boolean) {
        const { width } = this.props.visualServices.viewport,
            { maxSizePercent, collapsedSize } = VisualConfiguration.splitPane;
        return (isExpanded && width * maxSizePercent) || collapsedSize;
    }

    private resolveDefaultSize(isExpanded: boolean) {
        Debugger.LOG('EditorPane.resolveDefaultSize()');
        const { expandedWidth } = this.state,
            { collapsedSize } = VisualConfiguration.splitPane,
            resolvedWidth = (isExpanded && expandedWidth) || collapsedSize;
        Debugger.LOG(`Pane width resolved as ${resolvedWidth}px`);
        return resolvedWidth;
    }

    componentWillUnmount() {
        Debugger.LOG(`Editor unmounted. Updating pane size in API...`);
        this.props.visualServices.editorPaneWidth = 0;
    }

    private handlePaneToggle() {
        Debugger.LOG('EditorPane.handlePaneToggle()');
        Debugger.LOG(`Pane show/hide toggle clicked! Updating state...`);
        const { isExpanded } = this.state,
            { visualServices } = this.props,
            newExpanded = !isExpanded,
            width = this.resolveDefaultSize(newExpanded);
        visualServices.editorPaneWidth = width;
        visualServices.rendering.registerResizeEvent();
        this.setState(
            {
                isExpanded: newExpanded,
                width: width
            },
            () => visualServices.editor.resize()
        );
    }

    private handleResize(width: number) {
        Debugger.LOG('EditorPane.handleResize()');
        Debugger.LOG(`Pane resized to ${width}px. Updating state...`);
        this.setPaneWidth(width);
    }

    private setPaneWidth(width: number) {
        Debugger.LOG('EditorPane.setPaneWidth()');
        Debugger.LOG(`Setting pane width to ${width}px...`);
        const { visualServices } = this.props;
        visualServices.editorPaneWidth = width;
        visualServices.rendering.registerResizeEvent();
        this.setState(
            {
                width: width,
                expandedWidth: width
            },
            () => {
                visualServices.editor.resize();
            }
        );
    }
}
