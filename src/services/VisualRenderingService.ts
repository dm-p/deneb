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

import { VisualState } from '.';
import { Debugger, standardLog } from '../Debugger';

const owner = 'VisualRenderingService';

export class VisualRenderingService {
    private shouldVisualRender: boolean = true;
    private referenceState: VisualState = VisualState.Initial;

    constructor() {
        Debugger.LOG(`Instantiating [${owner}]`);
    }

    @standardLog()
    registerStateChangeEvent(state: VisualState) {
        Debugger.LOG('Registering state change...');
        Debugger.LOG(`State: ${state}`);
        if (this.referenceState !== state) {
            Debugger.LOG('Need to register volatile event.');
            this.registerVolatileEvent();
        }
        this.referenceState = state;
    }

    @standardLog()
    private registerVolatileEvent() {
        Debugger.LOG('Registering volatile event for visual render...');
        this.shouldVisualRender = true;
    }

    @standardLog()
    registerSegmentLoadEvent() {
        Debugger.LOG('Registering data segment load event...');
        this.registerVolatileEvent();
    }

    @standardLog()
    registerResizeEvent() {
        Debugger.LOG('Registering resize event...');
        this.registerVolatileEvent();
    }

    @standardLog()
    registerPersistEvent() {
        Debugger.LOG('Registering object persistence event...');
        this.registerVolatileEvent();
    }

    @standardLog()
    requestRender() {
        Debugger.LOG('Requesting re-render status...');
        if (this.shouldVisualRender) {
            Debugger.LOG('Visual should re-render');
            this.shouldVisualRender = false;
            return true;
        }
        Debugger.LOG('Visual does not need to re-render');
        return false;
    }
}
