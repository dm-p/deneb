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
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;
import DataView = powerbi.DataView;
import DataViewMetadata = powerbi.DataViewMetadata;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

// Internal dependencies
import { standardLog, Debugger } from '../Debugger';
import { VisualFeatures } from '../config';
import DataLimitSettings from '../properties/DataLimitSettings';
const enabled = VisualFeatures.fetchMoreData,
    owner = 'DataLimitService';

/**
 * Handles all logic around fetching more data from the data model, if needed.
 */
export class DataLimitService {
    canFetchMore: boolean = false;
    windowsLoaded: number;
    rowsLoaded: number;
    private featureIsEnabled = enabled;
    // Visual host services
    private host: IVisualHost;

    constructor(host: IVisualHost) {
        Debugger.LOG(`Instantiating [${owner}]`);
        this.host = host;
        Debugger.LOG(`[${owner}] instantiated!`);
    }

    /**
     * Look at the data limit settings and data view, and carry out additional loading of data if required.
     */
    @standardLog({ separator: true, profile: true, owner })
    public handleDataFetch(
        options: VisualUpdateOptions,
        settings: DataLimitSettings
    ) {
        Debugger.LOG('Data Limit Check/Fetch');

        if (this.featureIsEnabled) {
            Debugger.LOG('Feature enabled. Attempting...');
            if (
                options.operationKind === VisualDataChangeOperationKind.Create
            ) {
                Debugger.LOG('New data view (or first window).');
                this.canFetchMore = true;
                this.resetCounters();
            } else {
                Debugger.LOG('Subsequent window.');
                this.windowsLoaded++;
            }
            const dataView = options.dataViews[0];
            this.rowsLoaded = this.getRowCount(dataView);
            Debugger.LOG(
                `${this.rowsLoaded} row(s) currently available in the data view.`
            );
            if (this.shouldFetchMore(dataView?.metadata, settings)) {
                Debugger.LOG(
                    'Not all data loaded. Loading more (if we can)...'
                );
                Debugger.LOG(
                    `We have loaded ${this.windowsLoaded} times so far.`
                );
                this.canFetchMore = this.host.fetchMoreData(true);
            } else {
                Debugger.LOG(`We've got all the data we can get!`);
                Debugger.LOG(`${this.windowsLoaded} window(s)`);
                this.canFetchMore = false;
            }
        } else {
            Debugger.LOG('Skipping fetch of additional data.');
        }
    }

    /**
     * Checks for valid dataview and provides count of values.
     */
    @standardLog()
    private getRowCount(dataView: DataView): number {
        Debugger.LOG('Counting data view rows...');
        return dataView?.table?.rows?.length || 0;
    }

    /**
     * Confirms whether we should attempt to do the additional fetch or not, based on config and the data view metadata.
     */
    @standardLog()
    private shouldFetchMore(
        metadata: DataViewMetadata,
        settings: DataLimitSettings
    ): boolean {
        Debugger.LOG('Checking whether we should fetch more data or not...');
        return metadata.segment && settings.override && this.canFetchMore;
    }

    /**
     * Resets the window counters, when a brand new load is invoked
     */
    @standardLog()
    private resetCounters() {
        Debugger.LOG('Resetting loading counters...');
        this.windowsLoaded = 1;
        this.rowsLoaded = 0;
    }
}
