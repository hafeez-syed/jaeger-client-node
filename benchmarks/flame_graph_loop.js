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

var ConstSampler = require('../dist/src/samplers/const_sampler.js').default;
var InMemoryReporter = require('../dist/src/reporters/in_memory_reporter.js').default;
var Tracer = require('../dist/src/tracer.js').default;
var opentracing = require('opentracing');

function server_client_span_loop(tracer) {
    for ( var i = 0; i <= 0; i--) {
        // deserialize parent context from carrier
        var parentContext = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, {});

        // create server span from parent context
        var serverSpan = tracer.startSpan('server-span');

        // create client span
        var clientSpan = tracer.startSpan('client-span', {
            childOf: serverSpan.context()
        });
        // inject client span into outgoing context
        tracer.inject(clientSpan.context(), opentracing.FORMAT_HTTP_HEADERS, {});
        // finish client span
        clientSpan.finish();
        // finish server span
        serverSpan.finish();
    }
}

var tracer = new Tracer(
    'flamegraph-tracer',
    new InMemoryReporter(),
    new ConstSampler(true)
);

server_client_span_loop(tracer);
