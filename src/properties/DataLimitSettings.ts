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
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
import SettingsBase from './SettingsBase';
import { Debugger } from '../Debugger';
import { VisualConfiguration } from '../config';
let defaults = VisualConfiguration.settingsDefaults.dataLimit;

/**
 * Manages data limit override preferences for the visual.
 */
export default class DataLimitSettings extends SettingsBase {
    // Feature enabled or not
    public enabled: boolean = defaults.enabled;
    // Allow override of `dataReductionAlgorithm` limit.
    public override: boolean = defaults.override;
    // Display information about the custom visual limitations and recommendations for end users.
    public showCustomVisualNotes: boolean = defaults.showCustomVisualNotes;

    /**
     * Business logic for the properties within this menu.
     * @param instances `VisualObjectInstance[]` to process
     * @returns Processed `VisualObjectInstance[]`
     */
    public processEnumerationObject(
        enumerationObject: VisualObjectInstanceEnumerationObject,
        options: {
            [propertyName: string]: any;
        } = {}
    ): VisualObjectInstanceEnumerationObject {
        Debugger.LOG('Processing enumeration for data limit...');
        if (this.enabled) {
            enumerationObject.instances.map((i) => {
                // If not overriding then we don't need to show the addiitonal info options
                if (!this.override) {
                    Debugger.LOG('Removing additional properties...');
                    delete i.properties['showCustomVisualNotes'];
                }
            });
        } else {
            enumerationObject.instances = [];
        }
        return enumerationObject;
    }
}
