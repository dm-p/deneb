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

import { AutoApplyToggleProps, AutoApplyToggleState } from '..';
import { Debugger } from '../../Debugger';

export class AutoApplyToggle extends React.Component<
    AutoApplyToggleProps,
    AutoApplyToggleState
> {
    constructor(props: AutoApplyToggleProps) {
        super(props);
        this.state = {
            checked: props.persistChecked
        };
        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        Debugger.LOG('Rendering Component: [AutoApplyToggle]...');
        const ctlName = 'autoApply',
            { visualServices } = this.props,
            { localisationManager } = visualServices,
            { checked } = this.state;
        return (
            <>
                <div className='onoffswitch w3-right'>
                    <input
                        type='checkbox'
                        aria-checked={checked}
                        name={ctlName}
                        className='onoffswitch-checkbox'
                        id={ctlName}
                        checked={checked}
                        onChange={this.handleChange}
                        placeholder='hello'
                    />
                    <label className='onoffswitch-label' htmlFor={ctlName}>
                        <span
                            className='onoffswitch-inner'
                            data-on={localisationManager.getDisplayName(
                                'Auto_On'
                            )}
                            data-off={localisationManager.getDisplayName(
                                'Auto_Off'
                            )}
                        ></span>
                        <span className='onoffswitch-switch'></span>
                    </label>
                </div>
            </>
        );
    }

    /**
     * Handle toggle change event and manage state accordingly
     *
     * @param event - React event details
     */
    private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        Debugger.LOG('AutoApplyToggle.handleChange()');
        Debugger.LOG('Handling auto apply toggle state...');
        const checked = event.currentTarget.checked;
        const { visualServices } = this.props,
            { editor } = visualServices,
            replace = visualServices.property.getObjectPropertyForValue(
                'vega',
                'autoSave',
                checked
            );
        this.setState({ checked: checked }, () => {
            visualServices.property.updateObjectProperties(replace.properties);
            this.props.handleApplyClick(event);
            editor.focus();
        });
    }
}
