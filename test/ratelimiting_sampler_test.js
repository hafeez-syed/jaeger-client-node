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
import ProbabilisticSampler from '../src/samplers/probabilistic_sampler.js';
import RateLimiter from '../src/samplers/ratelimiting_sampler.js';
import sinon from 'sinon';

describe ('ratelimiting sampler should', () => {
    it('block after threshold is met', () => {
        let initialDate = new Date(2011,9,1).getTime();
        let clock = sinon.useFakeTimers(initialDate);
        let sampler = new RateLimiter(10);
        for (let i = 0; i < 10; i++) {
            sampler.isSampled(1);
        }

        assert.equal(sampler.maxTracesPerSecond, 10);
        assert.isNotOk(sampler.equal(new ProbabilisticSampler(0.5)));
        assert.equal(sampler.isSampled(), false, 'expected checkCredit to be false');
        clock = sinon.useFakeTimers(initialDate + 1000);
        assert.equal(sampler.isSampled(), true, 'expected checkCredit to be true');
        clock.restore();
    });

});
