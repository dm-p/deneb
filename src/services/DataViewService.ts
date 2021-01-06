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
import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewTable = powerbi.DataViewTable;

// Internal dependencies
import { Debugger, standardLog } from '../Debugger';
import {
    IVisualDataset,
    IVisualValueMetadata,
    IVisualValueRow,
    SupportedDataViewMapping
} from '.';

const owner = 'DataViewService';

/**
 * Used to handle Power BI dataView operations within the visual
 */
export class DataViewService {
    isDataViewValid: boolean = false;
    private dataViewMappingType: SupportedDataViewMapping;
    private hasValidDataViewMapping: boolean = false;
    private hasValidDataRoles: boolean = false;

    constructor(dataViewMappingType: SupportedDataViewMapping) {
        Debugger.LOG(`Instantiating [${owner}]`);
        this.dataViewMappingType = dataViewMappingType;
    }

    @standardLog({ profile: true, owner })
    validateDataView(dataViews: DataView[], dataRoles: string[] = []) {
        Debugger.LOG('Testing data view validity...');
        this.hasValidDataViewMapping = this.validateTableDataViewMapping(
            dataViews
        );
        let hasValidDataRoles = false;
        if (this.hasValidDataViewMapping) {
            Debugger.LOG('Confirming specified data roles are present...');
            hasValidDataRoles = true;
            dataRoles?.forEach((dr) => {
                Debugger.LOG(`Checking for role: ${dr}...`);
                hasValidDataRoles =
                    this.getDataRoleIndex(dataViews[0].metadata.columns, dr) >
                        -1 && hasValidDataRoles;
            });
        }
        this.hasValidDataRoles = hasValidDataRoles;
        const isValid = hasValidDataRoles && this.hasValidDataViewMapping;
        Debugger.LOG(`Data view validity = ${isValid}`);
        this.isDataViewValid = isValid;
    }

    /**
     * Validates the data view, to confirm that we can get past the spash screen
     *
     * @param dataViews - Visual dataView from update
     */
    @standardLog({ profile: true, owner })
    private validateTableDataViewMapping(dataViews?: DataView[]) {
        Debugger.LOG(
            'Testing [table] data view mapping has basic requirements...'
        );
        const result =
            (dataViews?.length > 0 &&
                dataViews[0]?.table &&
                dataViews[0]?.metadata?.columns &&
                true) ||
            false;
        Debugger.LOG(`Data view mapping validity = ${result}`);
        return result;
    }

    /**
     * Checks the supplied columns for the correct index of the content column, so that we can map it correctly later.
     *
     * @param columns   - Array of metadata columns from the Power BI data view.
     * @param role      - Name of data role to search for.
     */
    @standardLog()
    private getDataRoleIndex(columns: DataViewMetadataColumn[], role: string) {
        Debugger.LOG(`Searching dataView columns for role: ${role}...`);
        const result = columns.findIndex((c) => c.roles[`${role}`]);
        Debugger.LOG(`Role array index: ${result}`);
        return result;
    }

    /**
     * Processes the data in the visual's data view into an object suitable for the visual's API
     *
     * @param table     - Table data from visual data view
     */
    @standardLog({ profile: true, owner })
    getMappedDataset(table: DataViewTable): IVisualDataset {
        Debugger.LOG('Mapping data view into visual dataset...');
        Debugger.LOG('Initialising empty dataset...');
        const columns = table.columns,
            rows = (this.isDataViewValid && table.rows) || [],
            hasData = this.isDataViewValid && rows.length > 0,
            dataset = this.getEmptyDataset(),
            metadata: IVisualValueMetadata = {};
        try {
            Debugger.LOG('Getting metadata for all dataView columns...');
            columns.forEach((c) => {
                metadata[`${c.displayName}`] = {
                    ...c,
                    ...{ isColumn: !c.isMeasure, isRaw: false }
                };
            });
            Debugger.LOG('Getting data values...');

            if (hasData) {
                const values = table.rows.map((r) => {
                    let valueRow: IVisualValueRow = {};
                    r.forEach((c, ci) => {
                        const col = columns[ci],
                            base = col?.type.dateTime
                                ? new Date(c.toString())
                                : c,
                            value = base;
                        if (col?.roles?.values) {
                            valueRow[col.displayName] = value;
                        }
                    });
                    return valueRow;
                });
                dataset.metadata = metadata;
                dataset.values = values;
            }
        } catch (e) {
            Debugger.LOG('Error mapping the dataset!', e);
        } finally {
            Debugger.LOG('Dataset', dataset);
            Debugger.LOG(`${dataset.values.length} rows in dataset.`);
            return dataset;
        }
    }

    @standardLog()
    getEmptyDataset(): IVisualDataset {
        Debugger.LOG('Getting new empty dataset...');
        return {
            metadata: {},
            values: []
        };
    }
}
