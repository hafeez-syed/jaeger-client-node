// @flow
// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import NullLogger from '../logger.js';

const DEFAULT_BUFFER_FLUSH_INTERVAL_MILLIS = 10000;

export default class RemoteReporter {
    _bufferFlushInterval: number;
    _logger: Logger;
    _sender: Sender;
    _intervalHandle: any;

    constructor(sender: Sender,
                options: any = {}) {
        this._bufferFlushInterval = options.bufferFlushInterval || DEFAULT_BUFFER_FLUSH_INTERVAL_MILLIS;
        this._logger = options.logger || new NullLogger();
        this._sender = sender;
        this._intervalHandle = setInterval(() => {
            this.flush();
        }, this._bufferFlushInterval);
    }

    report(span: Span): void {
        let response: SenderResponse = this._sender.append(span._toThrift());
        if (response.err) {
            this._logger.error('Failed to append spans in reporter.');
        }
    }

    flush(callback: ?Function): void {
        let response: SenderResponse = this._sender.flush(callback);
        if (response.err) {
            this._logger.error('Failed to flush spans in reporter.');
        }
    }

    close(callback: ?Function): void {
        this._sender.close(callback);
        clearInterval(this._intervalHandle);
    }
}
