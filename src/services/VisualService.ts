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
import VisualUpdateType = powerbi.VisualUpdateType;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;
import ViewMode = powerbi.ViewMode;

// Internal dependencies
import VisualSettings from '../properties/VisualSettings';
import {
    DataLimitService,
    DataViewService,
    EditorService,
    VisualRenderingService,
    IVisualDataset,
    VisualState,
    SpecificationService,
    PropertyService
} from '.';
import { Debugger, standardLog } from '../Debugger';
import { MainInterface } from '../components';

const owner = 'VisualServices';

/**
 *
 */
export class VisualService {
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
    // Specification services
    specification: SpecificationService;
    // Property services
    property: PropertyService;
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
    // Data Limit Services
    dataLimit: DataLimitService;

    constructor(host: IVisualHost, localisationManager: ILocalizationManager) {
        Debugger.LOG(`Instantiating [${owner}]`);
        this.host = host;
        this.dataView = new DataViewService('table');
        this.dataLimit = new DataLimitService(host);
        this.editor = new EditorService();
        this.specification = new SpecificationService();
        this.rendering = new VisualRenderingService();
        this.property = new PropertyService(host, this.rendering);
        this.locale = host?.locale;
        this.localisationManager = localisationManager;
        this.settings = <VisualSettings>VisualSettings.getDefault();
        this.viewport = { width: 0, height: 0 };
        this.editorPaneWidth = 0;
        this.dataset = this.dataView.getEmptyDataset();
        Debugger.LOG('Visual API initialisation complete!');
    }

    getVisualWidth() {
        return this.viewport.width - this.editorPaneWidth;
    }

    @standardLog({ profile: true, separator: true, owner })
    resolveUpdateOptions(options: VisualUpdateOptions) {
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
                this.property.objects =
                    options.dataViews[0].metadata?.objects || {}; // TODO: Maybe nicer resolution
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
            const { vega } = this.settings;
            this.specification.parse(vega.jsonSpec, vega.provider);
        }

        MainInterface.UPDATE({ isEditMode: isEditMode });
    }

    private handleVisualStateChange(state: VisualState) {
        Debugger.LOG('VisualApi.handleVisualStateChange()');
        Debugger.LOG(`Setting visual state to ${state}`);
        this.state = state;
        this.rendering.registerStateChangeEvent(state);
    }
}
