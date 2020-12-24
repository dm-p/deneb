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

import { VisualState } from '..';
import { Debugger } from '../../Debugger';

export class VisualRenderingService {
    private shouldVisualRender: boolean = true;
    private referenceState: VisualState = VisualState.Initial;

    constructor() {
        Debugger.LOG('Instantiated [VisualRenderingService]');
    }

    registerStateChangeEvent(state: VisualState) {
        Debugger.LOG('VisualRenderingService.registerStateChangeEvent()');
        Debugger.LOG(`State: ${state}`);
        if (this.referenceState !== state) {
            this.registerVolatileEvent();
        }
        this.referenceState = state;
    }

    private registerVolatileEvent() {
        Debugger.LOG('VisualRenderingService.registerStateChangeEvent()');
        this.shouldVisualRender = true;
    }

    registerSegmentLoadEvent() {
        Debugger.LOG('VisualRenderingService.registerSegmentLoadEvent()');
        this.registerVolatileEvent();
    }

    registerResizeEvent() {
        Debugger.LOG('VisualRenderingService.registerResizeEvent()');
        this.registerVolatileEvent();
    }

    registerPersistEvent() {
        Debugger.LOG('VisualRenderingService.registerPersistEvent()');
        this.registerVolatileEvent();
    }

    requestRender() {
        Debugger.LOG('VisualRenderingService.requestRender()');
        if (this.shouldVisualRender) {
            this.shouldVisualRender = false;
            return true;
        }
        return false;
    }
}
