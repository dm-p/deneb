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
import { VisualConfiguration } from '../../config';
import { LandingPageProps } from '..';

const facts = [
    'Did you know... the Power BI icon cannot be reproduced using any of the core visuals? 😇',
    'the name "Deneb" is an attempt to attempt to fit-in with the Vega ecosystem. Deneb is the brightest star in Cygnus, and along with Vega and Altair, makes up the astronomical asterism called the Summer Triangle. The name "Altair" was already taken and is a Vega binding for Python.',
    'Vega is a "visualization grammar", where you can describe the visual appearance and interactive behavior of a visualization in a JSON format, and generate web-based views using Canvas or SVG.'
];

export class LandingPage extends React.Component<LandingPageProps, {}> {
    render() {
        Debugger.LOG('Rendering component: [VisualLandingPage]');
        return (
            <>
                <div className='w3-container' id='visualLandingPage'>
                    <div className='w3-cell-row top'>
                        <div className='w3-cell'>
                            <h3>{VisualConfiguration.metadata.displayName}</h3>
                        </div>
                        <div className='w3-cell visual-header-image logo' />
                    </div>
                    <div className='w3-cell-row section'>
                        <div className='text-muted assistive'>
                            {VisualConfiguration.metadata.description}
                            <br />
                            <small>
                                {VisualConfiguration.metadata.version}
                            </small>
                        </div>
                    </div>
                    <div>
                        <p>
                            Here's a random fact:{' '}
                            {facts[Math.floor(Math.random() * facts.length)]}
                        </p>
                    </div>
                </div>
            </>
        );
    }
}
