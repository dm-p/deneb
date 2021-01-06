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

// Internal dependencies
import { VisualFeatures } from './config';

type MethodMarkerExtent = 'start' | 'end';

interface ILogOptions {
    owner?: string;
    separator?: boolean;
    profile?: boolean;
    report?: boolean;
}

interface IProfileDetail {
    owner: string;
    methodName: string;
    duration: number;
}

export function standardLog(options?: ILogOptions) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        const targetMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const start = options?.profile && performance.now();
            options?.separator && Debugger.FOOTER();
            Debugger.METHOD_MARKER(propertyKey, 'start');
            const result = targetMethod.apply(this, args),
                finish = options?.profile && performance.now();
            options?.profile &&
                Debugger.ADD_PROFILING(
                    propertyKey,
                    options?.owner,
                    start,
                    finish
                );
            Debugger.METHOD_MARKER(propertyKey, 'end');
            options?.report && Debugger.PROFILE_REPORT();
            return result;
        };
        return descriptor;
    };
}

/**
 * Used to handle debugging, if enabled within the visual settings
 */
export class Debugger {
    // Indicates whether debugger is enabled (set by properties)
    private static enabled: boolean = VisualFeatures.developerMode;
    // Profiling info
    private static profiling: IProfileDetail[] = [];

    /**
     * Clears the console if debugging is enabled
     */
    static CLEAR() {
        if (this.enabled) {
            console.clear();
            this.profiling = [];
        }
    }

    /**
     * Create a heading within the browser console, if debugging is enabled
     * @param heading Text to display in the heading
     */
    static HEADING(heading: string) {
        if (this.enabled) {
            console.log(
                `\n====================\n${heading}\n====================`
            );
        }
    }

    /**
     * Create a footer if debugging is enabled, allowing you to demark sections within the console
     */
    static FOOTER() {
        if (this.enabled) {
            console.log(`====================`);
        }
    }

    /**
     * Write out the supplied args to the console, with tabbing
     * @param args Any items to output, separated by a comma, like for `console.log()`
     */
    static LOG(...args: any[]) {
        if (this.enabled) {
            console.log('  -', ...args);
        }
    }

    static METHOD_MARKER(
        name: string,
        extent: MethodMarkerExtent,
        options?: ILogOptions
    ) {
        if (this.enabled) {
            switch (extent) {
                case 'start': {
                    console.log(`<${name}>`);
                    return;
                }
                case 'end': {
                    console.log(`</${name}>`);
                    return;
                }
            }
        }
    }

    static ADD_PROFILING(
        methodName: string,
        owner: string,
        start: number,
        finish: number
    ) {
        if (this.enabled) {
            this.profiling.push({
                owner,
                methodName,
                duration: finish - start
            });
        }
    }

    static PROFILE_REPORT() {
        if (this.enabled) {
            this.HEADING('Profiling Report');
            console.table(this.profiling);
            this.FOOTER();
            this.profiling = [];
        }
    }

    static ERROR(e) {
        if (this.enabled) {
            console.error(e);
        }
    }
}
