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
import { VegaProvider } from '.';

const defaults = VisualConfiguration.settingsDefaults.vegaLiteTopLevelConfig;

/**
 * Manages the specification grammar and the user-provided source
 *
 * @property {string}               background  - CSS color property to use as the background of the entire view.
 * @property {string}               font        - Default font for all text marks, titles, and labels.
 * @property {number}               padding     - The default visualization padding, in pixels, from the edge of the visualization
 *                                                  canvas to the data rectangle. This is for all sides; custom padding should be
 *                                                  overridden in the View Specification.
 */
export default class VegaLiteTopLevelConfigSettings extends SettingsBase {
    public background = defaults.background;
    public font = defaults.font;
    public padding = defaults.padding;

    constructor() {
        super();
        this.validValues = {
            padding: {
                numberRange: {
                    min: 0,
                    max: 9999
                }
            }
        };
    }

    /**
     * Business logic for the properties within this menu.
     * @param enumerationObject - `VisualObjectInstanceEnumerationObject` to process.
     * @param options           - any specific options we wish to pass from elsewhere in the visual that our settings may depend upon.
     */
    public processEnumerationObject(
        enumerationObject: VisualObjectInstanceEnumerationObject,
        options: {
            [propertyName: string]: any;
        } = {}
    ): VisualObjectInstanceEnumerationObject {
        Debugger.LOG('Processing enumeration...');
        if (<VegaProvider>options.provider !== 'vegaLite') {
            enumerationObject.instances = [];
        } else {
            enumerationObject.instances.map((i) => {
                // Range validation
                Debugger.LOG('Range validation...');
                i.validValues = this.validValues;
            });
        }
        return enumerationObject;
    }
}
