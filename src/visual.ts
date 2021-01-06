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
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

// External dependencies
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Internal dependencies
import { standardLog, Debugger } from './Debugger';
import { MainInterface } from './components';
import { VisualService } from './services';
import VisualSettings from './properties/VisualSettings';

const owner = 'Visual';

export class Visual implements IVisual {
    private settings: VisualSettings;
    // The root element for the entire visual
    private container: HTMLElement;
    // React app container
    private reactRoot: React.ComponentElement<any, any>;
    // Visual host services
    private host: IVisualHost;
    // Handle rendering events
    private events: IVisualEventService;
    // Handle localisation of visual text
    private localisationManager: ILocalizationManager;
    // Visual API
    private visualApi: VisualService;

    constructor(options: VisualConstructorOptions) {
        try {
            Debugger.CLEAR();
            Debugger.HEADING('Visual Constructor');
            Debugger.LOG('Setting container element...');
            this.container = options.element;
            Debugger.LOG('Setting host services...');
            this.host = options.host;
            Debugger.LOG('Initialising localisation manager....');
            this.localisationManager = this.host.createLocalizationManager();
            Debugger.LOG('Getting events service...');
            this.events = this.host.eventService;
            Debugger.LOG('Initialising Visual API...');
            this.visualApi = new VisualService(
                this.host,
                this.localisationManager
            );
            Debugger.LOG('Creating main React component...');
            this.reactRoot = React.createElement(MainInterface, {
                visualServices: this.visualApi
            });
            ReactDOM.render(this.reactRoot, this.container);
        } catch (e) {
            Debugger.LOG('Error', e);
        }
    }

    @standardLog({ separator: true, profile: true, report: true, owner })
    public update(options: VisualUpdateOptions) {
        // DebuggerV1.HEADING('Visual Update');
        Debugger.LOG('Options', options);

        // Handle main update flow
        try {
            // Signal we've begun rendering
            Debugger.LOG('Rendering started.');
            this.events.renderingStarted(options);

            // Parse the settings for use in the visual
            Debugger.LOG('Parsing visual settings...');
            this.settings = this.visualApi.settings = Visual.parseSettings(
                options && options.dataViews && options.dataViews[0]
            );
            Debugger.LOG('Parsed settings', this.settings);

            // Update the visual API with latest data
            this.visualApi.resolveUpdateOptions(options);

            // Signal that we've finished rendering
            Debugger.LOG('Visual updated successfully!');
            this.events.renderingFinished(options);
            return;
        } catch (e) {
            // Signal that we've encountered an error
            Debugger.LOG('Error during update!', e);
            this.events.renderingFailed(options, e);
        } finally {
            Debugger.LOG('API', this.visualApi);
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions
    ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        let instances = (<VisualObjectInstanceEnumerationObject>(
                VisualSettings.enumerateObjectInstances(
                    this.settings || VisualSettings.getDefault(),
                    options
                )
            )).instances,
            objectName = options.objectName,
            enumerationObject: VisualObjectInstanceEnumerationObject = {
                containers: [],
                instances: instances
            };
        Debugger.FOOTER();
        Debugger.LOG(`Object Enumeration: ${objectName}`);

        // We try where possible to use the standard method signature to process the instance, but there are some exceptions...
        switch (objectName) {
            case 'vegaLiteTopLevelConfig': {
                this.settings.vegaLiteTopLevelConfig.processEnumerationObject(
                    enumerationObject,
                    {
                        provider: this.settings.vega.provider
                    }
                );
                break;
            }
            default: {
                // Check to see if the class has our method for processing business logic and run it if so
                if (
                    typeof this.settings[`${objectName}`]
                        .processEnumerationObject === 'function'
                ) {
                    Debugger.LOG(
                        'processEnumerationObject found. Executing...'
                    );
                    enumerationObject = this.settings[
                        `${objectName}`
                    ].processEnumerationObject(enumerationObject);
                } else {
                    Debugger.LOG(
                        "Couldn't find class processEnumerationObject function."
                    );
                }
            }
        }

        Debugger.LOG('Enumeration Object', enumerationObject);

        return enumerationObject;
    }
}
