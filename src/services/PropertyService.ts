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
import DataViewPropertyValue = powerbi.DataViewPropertyValue;

// Internal dependencies
import { Debugger, standardLog } from '../Debugger';
import VisualSettings from '../properties/VisualSettings';
import { VisualRenderingService } from '.';

const owner = 'PropertyService';

export class PropertyService {
    // Object metadata
    objects: DataViewObjects;
    // Visual host services
    private host: IVisualHost;

    private rendering: VisualRenderingService;

    constructor(host: IVisualHost, rendering: VisualRenderingService) {
        Debugger.LOG(`Instantiating [${owner}]`);
        this.host = host;
        this.rendering = rendering;
    }

    /**
     * Gets an empty metadata object so that we can populate it with a value from the text box, or reset it.
     */
    @standardLog()
    private getNewObjectInstance(
        objectName: string
    ): VisualObjectInstancesToPersist {
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

    /**
     * Handles resolution of grammar content based on whether the user is updating or resetting it
     *
     * @param value         - optional value of content. If not supplied, then we know to retrieve the default
     *                          value for that property from the visual settings
     */
    @standardLog()
    getObjectPropertyForValue(
        objectName: string,
        propertyName: string,
        value?: DataViewPropertyValue
    ) {
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
     * Manage persistence of content to the visual's dataView objects
     *
     * @param changes   - changes to apply to the dataView
     */
    @standardLog()
    updateObjectProperties(changes: VisualObjectInstancesToPersist) {
        Debugger.LOG('Persisting changes to dataView...', changes);
        this.rendering.registerPersistEvent();
        this.host.persistProperties(changes);
    }
}
