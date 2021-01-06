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

// External dependencies
import * as React from 'react';
import { createClassFromSpec, VegaLite } from 'react-vega';
import * as vega from 'vega';
import { TooltipHandlerService } from '../../services/TooltipHandlerService';

// Internal dependencies
import { Debugger } from '../../Debugger';
import { VisualRenderProps, SpecificationError, DataFetching } from '..';
import { VisualState } from '../../services';

export class VisualRender extends React.Component<VisualRenderProps, {}> {
    render() {
        Debugger.LOG('Rendering Component: [VisualRender]...');
        return this.resolveRenderState();
    }

    shouldComponentUpdate(nextProps: VisualRenderProps) {
        // Debugger.LOG('VisualRender.shouldComponentUpdate()');
        const { visualServices } = this.props,
            shouldRender = visualServices.rendering.requestRender();
        Debugger.LOG(`shouldUpdate = ${shouldRender}`);
        return shouldRender;
    }

    private resolveRenderState() {
        const { visualServices } = this.props,
            { rowsLoaded } = visualServices.dataLimit;

        Debugger.LOG('Determining visual render state...');
        switch (visualServices.state) {
            case VisualState.Fetching: {
                Debugger.LOG(`Updating fetch message to ${rowsLoaded} rows.`);
                return <DataFetching visualServices={visualServices} />;
            }
            case VisualState.Processing: {
                return <div>All rows loaded. Processing query result...</div>;
            }
            case VisualState.Processed: {
                return (
                    <div id='renderedVisual'>
                        {this.resolveVegaVisualComponent()}
                    </div>
                );
            }
            default: {
                return <div>Dunno LOL</div>;
            }
        }
    }

    /**
     * Provide the correct JSX element, depending on which flavou of Vega we choose.
     */
    private resolveVegaVisualComponent(): JSX.Element {
        Debugger.LOG('Resolving Vega/Vega-Lite component...');
        const { visualServices } = this.props,
            { vega: grammar } = visualServices.settings,
            { height } = visualServices.viewport,
            width = visualServices.getVisualWidth(),
            spec = visualServices.specification.spec,
            data = { values: visualServices.dataset.values },
            config = visualServices.specification.getInitialConfig(
                visualServices.settings
            );
        if (!spec.isValid) {
            return (
                <>
                    <SpecificationError
                        visualServices={visualServices}
                        error={spec.error}
                    />
                </>
            );
        }
        switch (grammar.provider) {
            case 'vegaLite': {
                Debugger.LOG('Rendering Vega Lite spec...', spec, data, config);
                return (
                    <VegaLite
                        spec={spec.spec}
                        data={data as any}
                        renderer={grammar.renderMode as vega.Renderers}
                        actions={false} // This creates blurring on some displays if enabled
                        width={width - 10}
                        height={height - 10}
                        tooltip={new TooltipHandlerService(visualServices).call}
                        config={config}
                    />
                );
            }
            case 'vega': {
                const VegaChart = createClassFromSpec({
                    spec: spec.spec
                });
                Debugger.LOG('Rendering Vega spec...', spec, data, config);
                return (
                    <VegaChart
                        data={data as any}
                        renderer={grammar.renderMode as vega.Renderers}
                        actions={false} // This creates blurring on some displays if enabled
                        width={width - 10}
                        height={height - 10}
                        tooltip={new TooltipHandlerService(visualServices).call}
                        config={config}
                    />
                );
            }
        }
    }
}
