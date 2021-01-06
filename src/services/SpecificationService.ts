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
import IColorInfo = powerbi.IColorInfo;

// External dependencies
import * as Vega from 'vega';
import Spec = Vega.Spec;
import * as VegaLite from 'vega-lite';
import { TopLevelSpec } from 'vega-lite';

// Internal dependencies
import { Debugger, standardLog } from '../Debugger';
import { VisualConfiguration } from '../config';
import { VegaProvider } from '../properties';
import { EditorService, ICompiledSpec, PropertyService } from '.';
import VisualSettings from '../properties/VisualSettings';

const owner = 'SpecificationService';

export class SpecificationService {
    spec: ICompiledSpec;

    constructor() {
        Debugger.LOG(`Instantiating [${owner}]`);
    }

    @standardLog({profile: true, separator: true, owner})
    persist(property: PropertyService, editor: EditorService) {
        Debugger.LOG('VisualApi.persistSpec()');
        const replace = property.getObjectPropertyForValue(
            'vega',
            'jsonSpec',
            editor.getText()
        );
        Debugger.LOG('Updating component state and persisting properties...');
        property.updateObjectProperties(replace.properties);
        editor.resolveDirtyStatus();
        editor.focus();
    }

    @standardLog({profile: true, separator: true, owner})
    parse(spec: string, provider: VegaProvider) {
        Debugger.LOG('Attempting to parse JSON spec...');
        try {
            const parsedSpec = JSON.parse(spec);
            Debugger.LOG('Spec', JSON.stringify(parsedSpec));
            switch (provider) {
                case 'vegaLite': {
                    Debugger.LOG('Attempting Vega-Lite...');
                    VegaLite.compile(<TopLevelSpec>parsedSpec);
                    Debugger.LOG('Vega-Lite spec parsed successfully :)');
                    break;
                }
                case 'vega': {
                    Debugger.LOG('Attempting Vega...');
                    Vega.parse(<Spec>parsedSpec);
                    Debugger.LOG('Vega spec parsed successfully :)');
                    break;
                }
            }
            this.spec = {
                isValid: true,
                spec: parsedSpec,
                rawSpec: spec
            };
        } catch (e) {
            Debugger.LOG(`[ERROR] Spec contains errors!`, e.message);
            this.spec = {
                isValid: false,
                spec: null,
                rawSpec: spec,
                error: e.message
            };
        }
    }

    @standardLog()
    getDefaultSpec(provider: VegaProvider) {
        const specTemplate = VisualConfiguration.specTemplate;
        Debugger.LOG(`Getting default spec for [${provider}]...`);
        switch (provider) {
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

    @standardLog()
    getInitialConfig(settings: VisualSettings) {
        // const category: string[] = this.host.colorPalette['colors'].map(
        //     (c: IColorInfo) => c.value
        // );
        const { vegaLiteTopLevelConfig } = settings;
        return {
            background: vegaLiteTopLevelConfig.background,
            font: vegaLiteTopLevelConfig.font,
            padding: vegaLiteTopLevelConfig.padding
            // range: {
            //     category: {
            //         scheme: category
            //     }
            // }
        };
    }
}
