/*
 * The MIT License
 *
 * Copyright (c) 2013-2014, CloudBees, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package hudson.widgets.buildsearch;

import hudson.model.Result;
import hudson.widgets.buildsearch.processors.DateProcessorFactory;
import org.junit.Assert;
import org.junit.Test;

import java.util.List;

/**
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class BuildSearchParamProcessorTest {

    @Test
    public void test_name() {
        BuildSearchParams searchParams = new BuildSearchParams(" name: Build1 name: Build2 ");
        List<BuildSearchParamProcessor> processors = new BuildSearchParamProcessorList(searchParams).getProcessors();

        Assert.assertEquals(1, processors.size());

        BuildSearchParamProcessor<String> processor = processors.get(0);
        Assert.assertTrue(processor.fitsSearchParams("Build1 was good"));
        Assert.assertTrue(processor.fitsSearchParams("The Build2 not so good"));
        Assert.assertFalse(processor.fitsSearchParams("Build3"));
    }

    @Test
    public void test_description() {
        BuildSearchParams searchParams = new BuildSearchParams(" desc: Build1 desc: Build2 ");
        List<BuildSearchParamProcessor> processors = new BuildSearchParamProcessorList(searchParams).getProcessors();

        Assert.assertEquals(1, processors.size());

        BuildSearchParamProcessor<String> processor = processors.get(0);
        Assert.assertTrue(processor.fitsSearchParams("Build1 was good"));
        Assert.assertTrue(processor.fitsSearchParams("The Build2 not so good"));
        Assert.assertFalse(processor.fitsSearchParams("Build3"));
    }

    @Test
    public void test_result() {
        BuildSearchParams searchParams = new BuildSearchParams(" result: UNSTABLE result: aborted result: BLAH ");
        List<BuildSearchParamProcessor> processors = new BuildSearchParamProcessorList(searchParams).getProcessors();

        Assert.assertEquals(1, processors.size());

        BuildSearchParamProcessor<Result> processor = processors.get(0);
        Assert.assertTrue(processor.fitsSearchParams(Result.UNSTABLE));
        Assert.assertTrue(processor.fitsSearchParams(Result.ABORTED));
        Assert.assertFalse(processor.fitsSearchParams(Result.SUCCESS));
        Assert.assertFalse(processor.fitsSearchParams(Result.FAILURE)); // need to make sure "BLAH" is not interpreted as FAILURE. See Result.fromString.
    }

    @Test
    public void test_date_from_and_to_ok() {
        BuildSearchParams searchParams = new BuildSearchParams("date-from: 2015-02-20 date-to: 2015-03-20");

        List<BuildSearchParamProcessor> processors = new BuildSearchParamProcessorList(searchParams).getProcessors();

        Assert.assertEquals(1, processors.size());

        BuildSearchParamProcessor<Long> processor = processors.get(0);

        Assert.assertFalse(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-19")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-20")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-21")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-03-19")));
        Assert.assertFalse(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-03-21")));
    }

    /**
     * date-to: set to a date before date-from: should result in the date-to: being ignored.
     */
    @Test
    public void test_date_from_and_to_with_to_before_from() {
        BuildSearchParams searchParams = new BuildSearchParams("date-from:2015-02-20 date-to:2015-02-10");

        List<BuildSearchParamProcessor> processors = new BuildSearchParamProcessorList(searchParams).getProcessors();

        Assert.assertEquals(1, processors.size());

        BuildSearchParamProcessor<Long> processor = processors.get(0);

        Assert.assertFalse(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-19")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-20")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-02-21")));
        Assert.assertTrue(processor.fitsSearchParams(DateProcessorFactory.toTimeInMillis("2015-03-21")));
    }
}
