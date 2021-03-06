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

import {assert} from 'chai';
import ConstSampler from '../src/samplers/const_sampler.js';
import InMemoryReporter from '../src/reporters/in_memory_reporter.js';
import MockLogger from './lib/mock_logger.js';
import RemoteReporter from '../src/reporters/remote_reporter.js';
import Tracer from '../src/tracer.js';
import UDPSender from '../src/reporters/udp_sender.js';

describe('Remote Reporter should', () => {
    let tracer;
    let reporter;
    let sender;
    let logger;

    beforeEach(() => {
        sender = new UDPSender();
        logger = new MockLogger();
        reporter = new RemoteReporter(sender, {logger}),
        tracer = new Tracer(
            'test-service-name',
            reporter,
            new ConstSampler(true)
        );
    });

    afterEach(() => {
        logger.clear();
        reporter.close();
    });

    it ('report span, and flush', () => {
        let span = tracer.startSpan('operation-name');

        // add duration to span, and report it
        span.finish();
        assert.equal(sender._spanBuffer.length, 1);

        reporter.flush()
        assert.equal(sender._spanBuffer.length, 0);
    });

    it ('report and flush span that is causes an error to be logged', () => {
        // make it so that all spans will be too large to be appended
        sender._maxSpanBytes = 1;

        let span = tracer.startSpan('operation-name');

        span.finish();
        assert.equal(logger._errorMsgs[0], 'Failed to append spans in reporter.');
    });
});
