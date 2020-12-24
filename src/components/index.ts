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

import { MainInterface } from './ui/MainInterface';
import { LandingPage } from './ui/LandingPage';
import { EditorPane } from './editor/EditorPane';
import { Editor } from './editor/Editor';
import { SpecPersistenceCommands } from './editor/SpecPersistenceCommands';
import { VisualRender } from './render/VisualRender';
import { SpecificationError } from './render/SpecificationError';
import { DataFetching } from './render/DataFetching';
import { AutoApplyToggle } from './editor/AutoApplyToggle';
import { VisualApi } from '../api';
import { JSONEditorOptions } from 'jsoneditor';

export {
    VisualApi,
    MainInterface,
    LandingPage,
    EditorPane,
    Editor,
    VisualRender,
    LandingPageProps,
    MainInterfaceProps,
    MainInterfaceState,
    EditorPaneProps,
    EditorPaneState,
    EditorProps,
    EditorState,
    VisualRenderProps,
    SpecPersistenceCommands,
    SpecPersistenceCommandsProps,
    SpecificationError,
    RenderErrorProps,
    AutoApplyToggle,
    AutoApplyToggleProps,
    AutoApplyToggleState,
    DataFetching,
    DataFetchingProps
};

interface UiBaseProps {
    // Visual API
    visualApi: VisualApi;
}

/**
 * Necessary properties to render the visual as a React component.
 */
interface MainInterfaceProps extends UiBaseProps {}

/**
 * The visual view model, managed via React state.
 */
interface MainInterfaceState {
    // Confirms that the visual is open in Power BI's edit mode rather than viewing
    isEditMode: boolean;
}

interface LandingPageProps extends UiBaseProps {}

interface EditorPaneProps extends UiBaseProps {}

interface EditorPaneState {
    width: number;
    expandedWidth: number;
    isExpanded: boolean;
    isDirty: boolean;
}

interface EditorProps extends UiBaseProps {
    resolveDirtyFlag(): void;
}

interface EditorState {
    options: JSONEditorOptions;
}

interface VisualRenderProps extends UiBaseProps {}

interface DataFetchingProps extends UiBaseProps {}

interface SpecPersistenceCommandsProps extends UiBaseProps {}

interface AutoApplyToggleProps extends UiBaseProps {
    persistChecked: boolean;
    handleApplyClick: (
        e:
            | React.MouseEvent<HTMLButtonElement, MouseEvent>
            | React.ChangeEvent<HTMLInputElement>
    ) => void;
}

interface AutoApplyToggleState {
    checked: boolean;
}

interface RenderErrorProps extends UiBaseProps {
    error: string;
}
