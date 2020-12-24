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
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

// Internal dependencies
import VisualApi from './VisualApi';
import { DataLimitService } from './services/DataLimitService';
import { DataViewService } from './services/DataViewService';
import { EditorService } from './services/EditorService';
import { VisualRenderingService } from './services/VisualRenderingService';

export {
    DataLimitService,
    DataViewService,
    EditorService,
    VisualApi,
    VisualRenderingService,
    SupportedDataViewMapping,
    VisualState,
    ICompiledSpec,
    IVisualDataset,
    IVisualValueMetadata,
    ITableColumnMetadata,
    IVisualValueRow
};

/**
 * Processed visual data and column metadata for rendering
 */
interface IVisualDataset {
    // All column information that we need to know about (including generated raw values)
    metadata: IVisualValueMetadata;
    // Raw data values for each column
    values: IVisualValueRow[];
}

/**
 * The structure of our visual dataset column metadata
 */
interface IVisualValueMetadata {
    // Column name & metadata
    [key: string]: ITableColumnMetadata;
}

/**
 * Custom data role metadata, needed to manage functionality within the editors
 */
interface ITableColumnMetadata extends DataViewMetadataColumn {
    // Flag to confirm if this is a column, according to the data model
    isColumn: boolean;
    // Flag to confirm if this is a generated raw value
    isRaw: boolean;
}

/**
 * Represents each values entry from the dataView
 */
interface IVisualValueRow {
    // Allow key/value pairs for any objects added to the content data role
    [key: string]: any;
}

interface ICompiledSpec {
    isValid: boolean;
    spec: object;
    error?: string;
}

type SupportedDataViewMapping = 'table';

enum VisualState {
    Initial = 0,
    Landing = 10,
    Fetching = 20,
    Processing = 30,
    Processed = 50
}
