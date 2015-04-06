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
package hudson.widgets.buildsearch.processors;

import hudson.model.Queue;
import hudson.model.Run;
import hudson.widgets.buildsearch.BuildSearchParamProcessor;
import hudson.widgets.buildsearch.BuildSearchParamProcessorFactory;
import hudson.widgets.buildsearch.BuildSearchParams;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

/**
 * Search build history by {@link hudson.model.Queue.Item#getInQueueSince()}
 * or {@link hudson.model.Run#getTimeInMillis()} using one or both of the
 * "date-from:" and "date-to:" tokens.
 *
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class DateProcessorFactory extends BuildSearchParamProcessorFactory {

    public static String LONG_DATE_FORMAT = "yyyy-MM-dd";
    public static String MEDIUM_DATE_FORMAT = "yy-MM-dd";
    public static String SHORT_DATE_FORMAT = "MM-dd";

    private static final String[] SEARCH_TERMS = new String[] {"date-from", "date-to"};

    /**
     * {@inheritDoc}
     */
    @Override
    public String[] getSearchTerms() {
        return SEARCH_TERMS;
    }

    // make this available to test code too
    public static Long toTimeInMillis(String date) {
        // In case the user forgot the format and used '/' instead of '-' as the delimiter.
        date = date.replace('/', '-');
        // In case there are spaces
        date = date.replace(" ", "");

        try {
            // SimpleDateFormat is not thread safe. What a PITA !!!
            if (date.length() == LONG_DATE_FORMAT.length()) {
                return new SimpleDateFormat(LONG_DATE_FORMAT).parse(date).getTime();
            } else if (date.length() == MEDIUM_DATE_FORMAT.length()) {
                return new SimpleDateFormat(MEDIUM_DATE_FORMAT).parse(date).getTime();
            } else if (date.length() == SHORT_DATE_FORMAT.length()) {
                return new SimpleDateFormat(SHORT_DATE_FORMAT).parse(date).getTime();
            } else {
                return null;
            }
        } catch (ParseException e) {
            return null;
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public BuildSearchParamProcessor createProcessor(BuildSearchParams searchParams) {
        final List<BuildSearchParams.BuildSearchParam> dateFromParams = searchParams.getParams(SEARCH_TERMS[0]);
        final List<BuildSearchParams.BuildSearchParam> dateToParams = searchParams.getParams(SEARCH_TERMS[1]);
        final Long dateFrom;
        final Long dateTo;

        if (dateFromParams.isEmpty() && dateToParams.isEmpty()) {
            // neither of the date search terms are specified
            return null;
        }

        // Only supports spec of a single pair of "date-from:" and "date-to:" search params.
        if (!dateFromParams.isEmpty()) {
            dateFrom = toTimeInMillis(dateFromParams.get(0).get());
        } else {
            dateFrom = null;
        }

        Long parseDateTo;
        if (!dateToParams.isEmpty()) {
            parseDateTo = toTimeInMillis(dateToParams.get(0).get());
        } else {
            parseDateTo = null;
        }

        if (dateFrom != null && parseDateTo != null) {
            if (dateFrom < parseDateTo) {
                dateTo = parseDateTo;
            } else {
                dateTo = null;
            }
        } else {
            dateTo = parseDateTo;
        }

        return new BuildSearchParamProcessor<Long>() {

            @Override
            public boolean fitsSearchParams(Long timeInMillis) {
                if (dateFrom != null && timeInMillis < dateFrom) {
                    return false;
                }
                if (dateTo != null && timeInMillis > dateTo) {
                    return false;
                }
                return true;
            }

            @Override
            public boolean fitsSearchParams(Queue.Item item) {
                return fitsSearchParams(item.getInQueueSince());
            }
            @Override
            public boolean fitsSearchParams(Run run) {
                return fitsSearchParams(run.getTimeInMillis());
            }
        };
    }
}
