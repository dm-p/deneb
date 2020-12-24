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

import { dataRoles } from '../../capabilities.json';
import { Data, Spec } from 'vega';
import { TopLevelSpec } from 'vega-lite';
import { VegaProvider, VegaRenderMode } from '../properties';

export {
    specTemplate,
    vegaSettingsDefaults,
    vegaLiteTopLevelSpecSettingsDefaults,
    ISpecTemplate,
    IVegaLiteTopLevelConfigSettingsDefaults,
    IVegaSettingsDefaults
};

interface ISpecTemplate {
    vega: Spec;
    vegaLite: TopLevelSpec;
}

interface IVegaLiteTopLevelConfigSettingsDefaults {
    background: string;
    font: string;
    padding: number;
}

interface IVegaSettingsDefaults {
    jsonSpec: string;
    provider: VegaProvider;
    renderMode: VegaRenderMode;
    autoSave: boolean;
}

const datasetName = dataRoles[0].name,
    vegaDataModelRef: Data = {
        name: datasetName
    },
    specTemplate: ISpecTemplate = {
        vegaLite: {
            $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
            config: {
                autosize: {
                    type: 'fit',
                    contains: 'padding'
                }
            },
            data: vegaDataModelRef,
            mark: 'bar',
            encoding: {
                x: {
                    field: 'add a measure name here',
                    type: 'quantitative'
                },
                y: {
                    field: 'add a category column name here',
                    type: 'nominal'
                }
            }
        },
        vega: {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            config: {
                autosize: {
                    type: 'fit',
                    contains: 'padding'
                }
            },
            description: 'Simple bar char with Vega.',
            data: [vegaDataModelRef],
            scales: [
                {
                    name: 'xscale',
                    type: 'band',
                    domain: {
                        data: `${datasetName}`,
                        field: 'category'
                    },
                    range: 'width',
                    padding: 0.05,
                    round: true
                },
                {
                    name: 'yscale',
                    domain: {
                        data: `${datasetName}`,
                        field: 'measure'
                    },
                    nice: true,
                    range: 'height'
                }
            ],
            axes: [
                {
                    scale: 'xscale',
                    orient: 'bottom',
                    labelAngle: -90,
                    tickOffset: 0,
                    labelAlign: 'right',
                    labelBaseline: 'middle'
                },
                {
                    orient: 'left',
                    scale: 'yscale'
                }
            ],
            marks: [
                {
                    type: 'rect',
                    from: {
                        data: `${datasetName}`
                    },
                    encode: {
                        enter: {
                            x: {
                                scale: 'xscale',
                                field: 'category'
                            },
                            width: {
                                scale: 'xscale',
                                band: 1
                            },
                            y: {
                                scale: 'yscale',
                                field: 'measure'
                            },
                            y2: {
                                scale: 'yscale',
                                value: 0
                            }
                        },
                        update: {
                            fill: {
                                value: 'steelblue'
                            }
                        }
                    }
                }
            ]
        }
    },
    vegaSettingsDefaults: IVegaSettingsDefaults = {
        jsonSpec: JSON.stringify(specTemplate.vegaLite, null, 4),
        provider: <VegaProvider>'vegaLite',
        renderMode: <VegaRenderMode>'svg',
        autoSave: false
    },
    vegaLiteTopLevelSpecSettingsDefaults: IVegaLiteTopLevelConfigSettingsDefaults = {
        background: 'white',
        font: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
        padding: 10
    };
