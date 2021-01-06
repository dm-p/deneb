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

import * as React from 'react';
import { Debugger } from '../../Debugger';
import { DataFetchingProps } from '..';

export class DataFetching extends React.Component<DataFetchingProps, {}> {
    render() {
        Debugger.LOG('Rendering Component: [SpecificationError]...');
        const { visualServices } = this.props,
            { rowsLoaded } = visualServices.dataLimit;

        return (
            <>
                <div className='w3-panel'>
                    <div className='w3-container' id='dataFetching'>
                        <div className='w3-cell-row top'>
                            <div className='w3-cell'>
                                <h3>
                                    {visualServices.localisationManager.getDisplayName(
                                        'Fetching_Data'
                                    )}
                                </h3>
                            </div>
                            <div className='w3-cell visual-header-image cog' />
                        </div>
                        <div className='w3-cell-row section'>
                            <div className='text-muted assistive'>
                                <b>{rowsLoaded}</b>{' '}
                                {visualServices.localisationManager.getDisplayName(
                                    'Fetching_Data_Progress_Suffix'
                                )}
                            </div>
                        </div>
                        {this.resolveCustomVisualNotes()}
                    </div>
                </div>
            </>
        );
    }

    private resolveCustomVisualNotes() {
        const { visualServices } = this.props,
            { dataLimit } = visualServices.settings;
        return (
            (dataLimit.enabled &&
                dataLimit.override &&
                dataLimit.showCustomVisualNotes && (
                    <>
                        <h5>Notes for Creators</h5>
                        <div className='text-muted assistive small'>
                            <p>
                                You're seeing this section because you've
                                enabled the{' '}
                                <b>
                                    {visualServices.localisationManager.getDisplayName(
                                        'Objects_DataLimit_Override'
                                    )}
                                </b>{' '}
                                property. There are some important things to
                                note if you're intending to use this in your
                                reports.
                            </p>
                            <p>
                                {' '}
                                You can prevent this message being displayed for
                                your end-users by turning off the{' '}
                                <b>
                                    {visualServices.localisationManager.getDisplayName(
                                        'Objects_DataLimit_ShowCustomVisualNotes'
                                    )}
                                </b>{' '}
                                property.
                            </p>
                            <p>These details will be added soon 😉</p>
                        </div>
                    </>
                )) || <p></p>
        );
    }
}
