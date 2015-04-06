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

import hudson.model.Queue;
import hudson.model.Run;

import java.util.ArrayList;
import java.util.List;

/**
 * Search param/term processor.
 *
 * <p>
 * Implementations created through a {@link BuildSearchParamProcessorFactory} implementation.
 *
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public abstract class BuildSearchParamProcessor<T> {

    /**
     * Does the supplied {@link Queue.Item} fit the {@link BuildSearchParams} used to create this
     * {@link BuildSearchParamProcessor} instance.
     * @param item The {@link Queue.Item} to test.
     * @return {@code true} if the {@link Queue.Item} fits, otherwise {@code false}.
     */
    public abstract boolean fitsSearchParams(Queue.Item item);

    /**
     * Does the supplied {@link Run} fit the {@link BuildSearchParams} used to create this
     * {@link BuildSearchParamProcessor} instance.
     * @param run The {@link Run} to test.
     * @return {@code true} if the {@link Run} fits, otherwise {@code false}.
     */
    public abstract boolean fitsSearchParams(Run run);

    /**
     * Does the supplied "data" fit the {@link BuildSearchParams} used to create this
     * {@link BuildSearchParamProcessor} instance.
     *
     * <p>
     * The {@link #fitsSearchParams(hudson.model.Queue.Item)} and {@link #fitsSearchParams(hudson.model.Run)}
     * implementations should call this function after extracting the appropriate data from the {@link Queue.Item}
     * or {@link Run}.
     *
     * @param data The data to test.
     * @return {@code true} if the {@link Run} fits, otherwise {@code false}.
     */
    public abstract boolean fitsSearchParams(T data);

    /**
     * Get the list of {@link BuildSearchParamProcessor} needed to process the supplied {@link BuildSearchParams}.
     * @param searchParams The search parameters to use for creating the list of {@link BuildSearchParamProcessor}.
     * @return The list of {@link BuildSearchParamProcessor}.
     */
    public static final List<BuildSearchParamProcessor> getProcessors(BuildSearchParams searchParams) {
        List<BuildSearchParamProcessor> processors = new ArrayList<BuildSearchParamProcessor>();
        for (BuildSearchParamProcessorFactory factory : BuildSearchParamProcessorFactory.all()) {
            BuildSearchParamProcessor processor = factory.createProcessor(searchParams);
            if (processor != null) {
                processors.add(processor);
            }
        }
        return processors;
    }
}
