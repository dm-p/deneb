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

import powerbi from 'powerbi-visuals-api';
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { TooltipHandler } from 'vega-typings';
import { View } from 'vega-typings';

import { Debugger, standardLog } from '../Debugger';
import { VisualService } from '.';

const owner = 'TooltipHandlerService';

/**
 * The tooltip handler class.
 */
export class TooltipHandlerService {
    /**
     * The handler function. We bind this to this function in the constructor.
     */
    public call: TooltipHandler;

    private visualApi: VisualService;

    /**
     * Create the tooltip handler and initialize the element and style.
     *
     * @param options Tooltip Options
     */
    constructor(visualApi: VisualService) {
        Debugger.LOG(`Instantiating [${owner}]`);
        this.visualApi = visualApi;
        this.call = this.tooltipHandler.bind(this);
    }

    /**
     * The tooltip handler function.
     */
    @standardLog({ profile: true, separator: true, owner })
    private tooltipHandler(
        handler: any,
        event: MouseEvent,
        item: any,
        value: any
    ) {
        Debugger.LOG('Tooltip handler called!', handler, event, item, value);
        const tooltipService = this.visualApi.host.tooltipService;

        const dataItems: VisualTooltipDataItem[] = Object.entries(
                item.tooltip
            ).map(([ttk, ttv]) => ({
                displayName: `${ttk}`,
                value: `${ttv}`
            })),
            coordinates: number[] = [event.clientX, event.clientY],
            isTouchEvent = false,
            identities = [];

        Debugger.LOG('Items', dataItems);

        switch (event.type) {
            case 'mouseover':
            case 'mousemove': {
                tooltipService.show({
                    coordinates: coordinates,
                    dataItems: dataItems,
                    isTouchEvent: isTouchEvent,
                    identities: identities
                });
                break;
            }
            case 'mouseout': {
                tooltipService.hide({ immediately: true, isTouchEvent: false });
            }
        }
    }
}

/**
 * Create a tooltip handler and register it with the provided view.
 *
 * @param {View}        view      - The Vega view.
 * @param {VisualService}   visualApi - Tooltip options.
 */
export default function (view: View, visualApi: VisualService) {
    const handler = new TooltipHandlerService(visualApi);

    view.tooltip(handler.call).run();

    return handler;
}
