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

import powerbi from 'powerbi-visuals-api';
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import * as ace from 'ace-builds';
import Ace = ace.Ace;
import Editor = Ace.Editor;
import Completer = Ace.Completer;
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import { Debugger } from '../../Debugger';
import * as vegaSchema from 'vega/build/vega-schema.json';
import * as vegaLiteSchema from 'vega-lite/build/vega-lite-schema.json';
import { VegaProvider } from '../../properties';
import { ITableColumnMetadata, IVisualValueMetadata } from '..';

export class EditorService {
    // jsoneditor instance
    private jsonEditor: JSONEditor;
    // Editor is dirty
    isDirty: boolean = false;

    constructor() {
        Debugger.LOG('Instantiating [EditorService]...');
    }

    new(element: HTMLDivElement, options: JSONEditorOptions) {
        Debugger.LOG('EditorService.new()');
        this.jsonEditor = new JSONEditor(element, options);
    }

    focus() {
        this.jsonEditor.focus();
    }

    getText() {
        Debugger.LOG('EditorService.getText()');
        return this.jsonEditor.getText();
    }

    setText(text: string) {
        Debugger.LOG('EditorService.setText()');
        this.jsonEditor.setText(text);
    }

    resize() {
        Debugger.LOG('EditorService.resize()');
        this.getAceEditorInstance().resize(true);
    }

    resolveDirtyStatus(text?: string) {
        Debugger.LOG('EditorService.resolveDirtyStatus()');
        this.isDirty = this.getText() !== (text || this.getText());
    }

    setProvider(provider: VegaProvider) {
        switch (provider) {
            case 'vegaLite': {
                this.jsonEditor.setSchema(vegaLiteSchema);
                break;
            }
            case 'vega': {
                this.jsonEditor.setSchema(vegaSchema);
                break;
            }
            default: {
                this.jsonEditor.setSchema(null);
            }
        }
    }

    setAceEditorOptions(optList: { [key: string]: any }) {
        Debugger.LOG('EditorService.setAceEditorOptions()');
        this.getAceEditorInstance().setOptions(optList);
    }

    private getAceEditorInstance(): Editor {
        Debugger.LOG('EditorService.getAceEditorInstance()');
        return (<any>this.jsonEditor)?.aceEditor;
    }

    updateCompleters(
        metadata: IVisualValueMetadata,
        localisationManager: ILocalizationManager
    ) {
        Debugger.LOG('EditorService.updateCompleters()');
        Debugger.LOG(`Updating editor completers...`);
        let instance = this.getAceEditorInstance();
        if (!instance) {
            Debugger.LOG('Currently no editor to update. Skipping over...');
            return;
        }
        let completers = this.getAceEditorInstance().completers;
        // This is messy, but will remove the custom completer if it's already been added
        Debugger.LOG('Fixing existing completers...');
        if (completers.length > 2) {
            completers.pop();
        }
        this.getAceEditorInstance().completers = completers.concat([
            this.getCompleters(metadata, localisationManager)
        ]);
    }

    /**
     * For an editor, we need to populate the completers for the end-user.
     */
    private getCompleters(
        metadata: IVisualValueMetadata,
        localisationManager: ILocalizationManager
    ): Completer {
        Debugger.LOG('EditorService.getCompleters()');
        Debugger.LOG('Getting completers for editor...');
        let tokens = [];
        // Tokens for columns and measures
        Debugger.LOG('Adding completers for dataset...');
        Object.entries(metadata).forEach(([key, value], i) => {
            Debugger.LOG(`[${key}]`);
            tokens.push({
                name: `${key}`,
                value: `${key}`,
                caption: `${key}`,
                meta: this.resolveCompleterMeta(
                    metadata[`${key}`],
                    localisationManager
                ),
                score: this.resolveCompleterScore(metadata[`${key}`], i)
            });
        });
        Debugger.LOG('All completers added!');
        return {
            getCompletions: (editor, session, pos, prefix, callback) => {
                callback(null, tokens);
            }
        };
    }

    /**
     * For any data-based completers in the editor, provide a qualifier denoting whether it's a column,
     * measure or something else.
     *
     * @param column    - column to evaluate
     */
    private resolveCompleterMeta(
        column: ITableColumnMetadata,
        localisationManager: ILocalizationManager
    ) {
        Debugger.LOG('EditorService.resolveCompleterMeta()');
        Debugger.LOG(
            `Resolving completer metadata for [${column.displayName}]...`
        );
        switch (true) {
            case column.isRaw && column.isMeasure: {
                Debugger.LOG('Type: raw value (measure)');
                return `${localisationManager.getDisplayName(
                    'Completer_Cap_Measure'
                )} ${localisationManager.getDisplayName('Completer_Cap_Raw')}`;
            }
            case column.isRaw: {
                Debugger.LOG('Type: raw value (column)');
                return `${localisationManager.getDisplayName(
                    'Completer_Cap_Column'
                )} ${localisationManager.getDisplayName('Completer_Cap_Raw')}`;
            }
            case column.isMeasure: {
                Debugger.LOG('Type: measure');
                return localisationManager.getDisplayName(
                    'Completer_Cap_Measure'
                );
            }
            default: {
                Debugger.LOG('Type: column');
                return localisationManager.getDisplayName(
                    'Completer_Cap_Column'
                );
            }
        }
    }

    /**
     * Applies an order of precedence for an object in the editor's auto-completion.
     *
     * @param column    - column to evaluate
     * @param index     - sequential order from calling iterator
     */
    private resolveCompleterScore(column: ITableColumnMetadata, index: number) {
        Debugger.LOG('EditorService.resolveCompleterScore()');
        Debugger.LOG(
            `Resolving completer score for [${column.displayName}]...`
        );
        switch (true) {
            case column.isRaw: {
                return 1000 + index;
            }
            case column.isMeasure:
            case column.isColumn: {
                return 2000 + index;
            }
        }
    }
}
