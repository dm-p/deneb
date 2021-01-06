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
import * as Ajv from 'ajv';
import * as draft06 from 'ajv/lib/refs/json-schema-draft-06.json';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

// Internal dependencies
import { Debugger } from '../../Debugger';
import { EditorProps, EditorState } from '..';

export class Editor extends React.Component<EditorProps, EditorState> {
    // Container the editor will reside in
    private container: HTMLDivElement;
    // AJv for JSON schema validation
    private ajv: Ajv.Ajv = new Ajv({});

    constructor(props: EditorProps) {
        super(props);
        this.handleText = this.handleText.bind(this);
        this.bindEditorElement = this.bindEditorElement.bind(this);
        this.ajv.addFormat('color-hex', () => true); // Handles schema issue w/vega & vega-lite
        this.ajv.addMetaSchema(draft06);
        this.state = {
            options: {
                modes: [],
                ace: ace as any,
                ajv: this.ajv,
                mode: 'code',
                theme: 'ace/theme/github',
                onChangeText: this.handleText
            }
        };
    }

    render() {
        Debugger.LOG('Rendering Component: [VisualEditor]...');
        return (
            <>
                <div className='editor-responsive' id='editor'>
                    <div id='editorBounding'>
                        <div
                            className='jsoneditor-container'
                            ref={this.bindEditorElement}
                        />
                    </div>
                </div>
            </>
        );
    }

    componentDidUpdate() {
        Debugger.LOG('Updated Component: [VisualEditor]');
        this.setAceEditorBehaviour();
    }

    componentDidMount() {
        Debugger.LOG(`Mounted Component: [VisualEditor]`);
        this.props.visualServices.editor.new(
            this.container,
            this.state.options
        );
        Debugger.LOG('Setting spec from properties...');
        this.props.visualServices.editor.setText(
            this.props.visualServices.settings.vega.jsonSpec
        );
        this.setAceEditorBehaviour();
    }

    private bindEditorElement(element: HTMLDivElement) {
        Debugger.LOG('Binding editor to element...');
        this.container = element;
    }

    private handleText() {
        Debugger.LOG('Editor.handleText()');
        Debugger.LOG('Handling text entry...');
        const { resolveDirtyFlag, visualServices } = this.props,
            { editor, property, specification} = visualServices,
            { autoSave } = visualServices.settings.vega;
        if (autoSave) {
            specification.persist(property, editor);
        } else {
            Debugger.LOG('Auto-apply disabled - state resolution required...');
            resolveDirtyFlag();
        }
    }

    private setAceEditorBehaviour() {
        Debugger.FOOTER();
        Debugger.LOG('Setting editor behaviour...');
        const { visualServices } = this.props;
        visualServices.editor.setAceEditorOptions({
            useWorker: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });
        visualServices.editor.setProvider(
            visualServices.settings.vega.provider
        );
        visualServices.editor.updateCompleters(
            visualServices.dataset.metadata,
            visualServices.localisationManager
        );
        Debugger.LOG('Finished setting behaviour!');
    }
}
