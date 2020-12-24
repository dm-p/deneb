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
import { RenderErrorProps } from '..';

export class SpecificationError extends React.Component<RenderErrorProps, {}> {
    render() {
        Debugger.LOG('Rendering Component: [SpecificationError]...');
        const { visualApi, error } = this.props;

        return (
            <>
                <div className='w3-panel'>
                    <div className='w3-container' id='visualSpecError'>
                        <div className='w3-cell-row top'>
                            <div className='w3-cell'>
                                <h3>
                                    {visualApi.localisationManager.getDisplayName(
                                        'Spec_Error_Heading'
                                    )}
                                </h3>
                            </div>
                            <div className='w3-cell visual-header-image spec-error' />
                        </div>
                        <div className='w3-cell-row section'>
                            <div className='text-muted assistive'>
                                {visualApi.localisationManager.getDisplayName(
                                    'Spec_Error_Overview'
                                )}
                            </div>
                        </div>
                        <div>
                            <p>
                                <code>{error}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
