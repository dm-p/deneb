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

import { visual } from '../../pbiviz.json';
import { MainInterfaceState } from '../components';
import {
    specTemplate,
    vegaLiteTopLevelSpecSettingsDefaults,
    vegaSettingsDefaults,
    ISpecTemplate,
    IVegaLiteTopLevelConfigSettingsDefaults,
    IVegaSettingsDefaults
} from './vega';

export {
    VisualConfiguration,
    VisualFeatures,
    IVisualConfiguration,
    ISpecTemplate
};

const VisualFeatures = {
    developerMode: true,
    fetchMoreData: true
};

const splitPaneDefaults = {
        minSize: 300,
        maxSizePercent: 0.6,
        defaultSizePercent: 0.4,
        collapsedSize: 36
    },
    dataLimitDefaults = {
        enabled: VisualFeatures.fetchMoreData,
        override: false,
        showCustomVisualNotes: true
    };

const VisualConfiguration: IVisualConfiguration = {
    metadata: visual,
    settingsDefaults: {
        dataLimit: dataLimitDefaults,
        vega: vegaSettingsDefaults,
        vegaLiteTopLevelConfig: vegaLiteTopLevelSpecSettingsDefaults
    },
    stateDefaults: {
        visualInterface: {
            isEditMode: false
        }
    },
    splitPane: splitPaneDefaults,
    specTemplate: specTemplate
};

interface IVisualConfiguration {
    metadata: IVisualMetadata;
    settingsDefaults: ISettingsDefaults;
    stateDefaults: IStateDefaults;
    splitPane: { [key: string]: any };
    specTemplate: ISpecTemplate;
}

interface IVisualMetadata {
    name: string;
    displayName: string;
    guid: string;
    visualClassName: string;
    version: string;
    description: string;
    supportUrl: string;
    gitHubUrl: string;
}

interface ISettingsDefaults {
    dataLimit: { [key: string]: any };
    vega: IVegaSettingsDefaults;
    vegaLiteTopLevelConfig: IVegaLiteTopLevelConfigSettingsDefaults;
}

interface IStateDefaults {
    visualInterface: MainInterfaceState;
}
