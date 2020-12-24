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
import { SpecPersistenceCommandsProps, AutoApplyToggle } from '..';

export class SpecPersistenceCommands extends React.Component<SpecPersistenceCommandsProps> {
    constructor(props: SpecPersistenceCommandsProps) {
        super(props);
        this.handleApplyClick = this.handleApplyClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
    }

    render() {
        Debugger.LOG('Rendering Component: [VisualEditorCommand]...');
        const { visualApi } = this.props,
            { vega } = visualApi.settings,
            { editor, localisationManager } = visualApi;
        Debugger.LOG(`Dirty=${editor.isDirty}`);
        return (
            <>
                <div className='assistive small'>
                    {this.resolveApplyStatus()}
                </div>
                <div>
                    <button
                        className='w3-button w3-right w3-small secondary w3-border'
                        type='button'
                        onClick={this.handleResetClick}
                    >
                        {localisationManager.getDisplayName('Button_Reset')}
                    </button>
                    <AutoApplyToggle
                        visualApi={visualApi}
                        persistChecked={vega.autoSave}
                        handleApplyClick={this.handleApplyClick}
                    />
                    {this.resolveApplyButton()}
                </div>
            </>
        );
    }

    private resolveApplyStatus() {
        const { visualApi } = this.props,
            { localisationManager, editor } = visualApi;
        return (
            (editor.isDirty &&
                localisationManager.getDisplayName('Apply_Unsynced')) ||
            localisationManager.getDisplayName('Apply_Synced')
        );
    }

    private resolveApplyButton() {
        const { visualApi } = this.props,
            { vega } = visualApi.settings,
            { localisationManager } = visualApi;
        Debugger.LOG('Resolving Apply button...');
        return (
            <>
                <button
                    className={`w3-button w3-right w3-small primary w3-border`}
                    type='button'
                    disabled={this.isApplyButtonDisabled()}
                    onClick={this.handleApplyClick}
                >
                    {localisationManager.getDisplayName('Button_Apply')}
                </button>
            </>
        );
    }

    private isApplyButtonDisabled() {
        const { visualApi } = this.props,
            { vega } = visualApi.settings,
            { editor } = visualApi;
        return vega.autoSave || !editor.isDirty;
    }

    /**
     * Resets the text area content back to the default, and sets property in the visual.
     *
     * @param e - Click event
     */
    private handleApplyClick = (
        e:
            | React.MouseEvent<HTMLButtonElement, MouseEvent>
            | React.ChangeEvent<HTMLInputElement>
    ) => {
        Debugger.LOG(`Applying changes to JSON spec from editor...`);
        e.preventDefault();
        this.persistSpec();
    };

    /**
     * Resets the text area content back to the default, and sets property in the visual.
     *
     * @param e - Click event
     */
    private handleResetClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        const { visualApi } = this.props,
            { editor } = visualApi,
            grammar = visualApi.settings.vega,
            defaultSpec = visualApi.getDefaultSpec(),
            reset = visualApi.getObjectPropertyForValue(
                'vega',
                'jsonSpec',
                defaultSpec
            );
        Debugger.LOG(`Resetting editor content for [${grammar.provider}]...`);
        e.preventDefault();
        editor.setText(defaultSpec);
        editor.focus();
        Debugger.LOG('Updating component state and persisting properties...');
        visualApi.updateObjectProperties(reset.properties);
    };

    private persistSpec() {
        Debugger.LOG('Persisting spec (from Apply button)...');
        const { visualApi } = this.props;
        visualApi.persistSpec();
    }
}
