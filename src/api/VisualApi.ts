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

// Power BI API Dependencies
import powerbi from 'powerbi-visuals-api';
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import DataViewObjects = powerbi.DataViewObjects;
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
import IViewport = powerbi.IViewport;
import IColorInfo = powerbi.IColorInfo;
import VisualUpdateType = powerbi.VisualUpdateType;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;
import ViewMode = powerbi.ViewMode;

// External dependencies
import * as Vega from 'vega';
import Spec = Vega.Spec;
import * as VegaLite from 'vega-lite';
import { TopLevelSpec } from 'vega-lite';

// Internal dependencies
import VisualSettings from '../properties/VisualSettings';
import {
    DataLimitService,
    DataViewService,
    EditorService,
    VisualRenderingService,
    IVisualDataset,
    ICompiledSpec,
    VisualState
} from '.';
import { Debugger } from '../Debugger';
import { VisualConfiguration } from '../config';
import { MainInterface } from '../components';

/**
 *
 */
export default class VisualApi {
    // Visual host services
    host: IVisualHost;
    // Handle localisation of visual text
    localisationManager: ILocalizationManager;
    // Data view services
    dataView: DataViewService;
    // Editor services
    editor: EditorService;
    // Visual rendering services
    rendering: VisualRenderingService;
    // Indication of visual state for various operations, that the UI can use
    state: VisualState = VisualState.Initial;
    // Current locale
    locale: string;
    // Visual dataset
    dataset: IVisualDataset;
    // Visual settings
    settings: VisualSettings;
    // Visual viewport
    viewport: IViewport;
    // Editor pane width - used to offset width of visual
    editorPaneWidth: number;
    // visual spec
    spec: ICompiledSpec;
    // Data Limit Services
    dataLimit: DataLimitService;
    // Object metadata
    private objects: DataViewObjects;

    constructor(host: IVisualHost, localisationManager: ILocalizationManager) {
        this.host = host;
        this.dataView = new DataViewService('table');
        this.dataLimit = new DataLimitService(host);
        this.editor = new EditorService();
        this.rendering = new VisualRenderingService();
        this.locale = host?.locale;
        this.localisationManager = localisationManager;
        this.settings = <VisualSettings>VisualSettings.getDefault();
        this.viewport = { width: 0, height: 0 };
        this.editorPaneWidth = 0;
        this.dataset = this.dataView.getEmptyDataset();
        Debugger.LOG('Visual API initialisation complete!');
    }

    /**
     * Handles resolution of grammar content based on whether the user is updating or resetting it
     *
     * @param value         - optional value of content. If not supplied, then we know to retrieve the default
     *                          value for that property from the visual settings
     */
    getObjectPropertyForValue(
        objectName: string,
        propertyName: string,
        value?: powerbi.DataViewPropertyValue
    ) {
        Debugger.LOG('VisualApi.getObjectPropertyForValue()');
        Debugger.LOG(`Resolving content for ${objectName}.${propertyName}...`);
        Debugger.LOG(`Supplied value: ${value}`);
        try {
            const changes = this.getNewObjectInstance(objectName),
                defaultValue = <string>(
                    VisualSettings.getDefault()[objectName][propertyName]
                );
            changes.replace[0].properties[propertyName] = value ?? defaultValue;
            Debugger.LOG('Resolved object properties', changes);
            return {
                properties: changes,
                defaultValue: defaultValue
            };
        } catch (e) {
            Debugger.ERROR(e);
        }
    }

    /**
     * Gets an empty metadata object so that we can populate it with a value from the text box, or reset it.
     */
    private getNewObjectInstance(
        objectName: string
    ): VisualObjectInstancesToPersist {
        Debugger.LOG('VisualApi.getNewObjectInstance()');
        Debugger.LOG('Getting new object instance for persistence...');
        return {
            replace: [
                {
                    objectName: objectName,
                    selector: null,
                    properties: this.objects[objectName] || {}
                }
            ]
        };
    }

    getStaticConfig() {
        const category: string[] = this.host.colorPalette['colors'].map(
            (c: IColorInfo) => c.value
        );
        const { vegaLiteTopLevelConfig } = this.settings;
        return {
            background: vegaLiteTopLevelConfig.background,
            font: vegaLiteTopLevelConfig.font,
            padding: vegaLiteTopLevelConfig.padding,
            range: {
                category: {
                    scheme: category
                }
            }
        };
    }

    persistSpec() {
        Debugger.LOG('VisualApi.persistSpec()');
        const replace = this.getObjectPropertyForValue(
            'vega',
            'jsonSpec',
            this.editor.getText()
        );
        Debugger.LOG('Updating component state and persisting properties...');
        this.updateObjectProperties(replace.properties);
        this.editor.resolveDirtyStatus();
        this.editor.focus();
    }

    getVisualWidth() {
        return this.viewport.width - this.editorPaneWidth;
    }

    /**
     * Manage persistence of content to the visual's dataView objects
     *
     * @param changes   - changes to apply to the dataView
     */
    updateObjectProperties(changes: VisualObjectInstancesToPersist) {
        Debugger.LOG('Persisting changes to dataView...', changes);
        this.rendering.registerPersistEvent();
        this.host.persistProperties(changes);
    }

    resolveUpdateOptions(options: VisualUpdateOptions) {
        Debugger.LOG('VisualApi.resolveUpdateOptions()');
        Debugger.LOG('Resolving visual update options for API operations...');
        const dataView = this.dataView,
            isEditMode =
                options.viewMode === ViewMode.Edit && options.isInFocus;

        this.viewport = options.viewport;

        switch (options.type) {
            case VisualUpdateType.All:
            case VisualUpdateType.Data: {
                this.handleVisualStateChange(VisualState.Fetching);
                this.rendering.registerSegmentLoadEvent();

                // If first segment, we test and set state accordingly for user feedback
                if (
                    options.operationKind ===
                    VisualDataChangeOperationKind.Create
                ) {
                    Debugger.LOG(
                        'First data segment. Doing initial state checks...'
                    );
                    dataView.validateDataView(options.dataViews, ['values']);
                }

                // If the DV didn't validate then we shouldn't expend effort mapping it and just display landing page
                if (!dataView.isDataViewValid) {
                    Debugger.LOG(
                        "Data view isn't valid, so need to show Landing page."
                    );
                    this.handleVisualStateChange(VisualState.Landing);
                    this.dataset = dataView.getEmptyDataset();
                    break;
                }

                Debugger.LOG('Assigning objects...');
                this.objects = options.dataViews[0].metadata?.objects || {}; // TODO: Maybe nicer resolution
                Debugger.LOG('Delegating additional data fetch...');
                this.dataLimit.handleDataFetch(
                    options,
                    this.settings.dataLimit
                );
                if (!this.dataLimit.canFetchMore) {
                    Debugger.LOG('Updating Visual API with latest data...');
                    this.dataset = dataView.getMappedDataset(
                        options.dataViews[0].table
                    );
                    this.handleVisualStateChange(VisualState.Processed);
                }
                break;
            }
            default: {
                this.rendering.registerResizeEvent();
            }
        }

        if (this.state === VisualState.Processed) {
            this.parseSpec();
        }

        MainInterface.UPDATE({ isEditMode: isEditMode });
    }

    private handleVisualStateChange(state: VisualState) {
        Debugger.LOG('VisualApi.handleVisualStateChange()');
        Debugger.LOG(`Setting visual state to ${state}`);
        this.state = state;
        this.rendering.registerStateChangeEvent(state);
    }

    getDefaultSpec() {
        const grammar = this.settings.vega,
            specTemplate = VisualConfiguration.specTemplate;
        Debugger.LOG(`Resetting editor content for [${grammar.provider}]...`);
        switch (grammar.provider) {
            case 'vegaLite': {
                return JSON.stringify(specTemplate.vegaLite, null, 4);
            }
            case 'vega': {
                return JSON.stringify(specTemplate.vega, null, 4);
            }
            default: {
                return '{}';
            }
        }
    }

    parseSpec() {
        Debugger.LOG('VisualApi.parseSpec()');
        Debugger.LOG('Attempting to parse JSON spec...');
        const grammar = this.settings.vega,
            spec = JSON.parse(grammar.jsonSpec);
        try {
            Debugger.LOG('Spec', JSON.stringify(spec));
            switch (grammar.provider) {
                case 'vegaLite': {
                    Debugger.LOG('Attempting Vega-Lite...');
                    VegaLite.compile(<TopLevelSpec>spec);
                    Debugger.LOG('Vega-Lite spec parsed successfully :)');
                    break;
                }
                case 'vega': {
                    Debugger.LOG('Attempting Vega...');
                    Vega.parse(<Spec>spec);
                    Debugger.LOG('Vega spec parsed successfully :)');
                    break;
                }
            }
            this.spec = {
                isValid: true,
                spec: spec
            };
        } catch (e) {
            Debugger.LOG(`[ERROR] Spec contains errors!`, e.message);
            this.spec = {
                isValid: false,
                spec: spec,
                error: e.message
            };
        }
    }
}
