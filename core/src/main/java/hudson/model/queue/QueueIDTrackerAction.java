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
package hudson.model.queue;

import hudson.model.InvisibleAction;
import hudson.model.Run;

import javax.annotation.Nonnull;

/**
 * An {@link hudson.model.Action} for tracking a {@link hudson.model.Run} back to
 * it's original {@link hudson.model.Queue} identifier (from it's original
 * queue {@link hudson.model.Queue.WaitingItem}).
 * <p/>
 * This provides a unique sequence ID spanning all builds of a {@link hudson.model.Job},
 * no matter what state build (pending, running, completed etc).
 *
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class QueueIDTrackerAction extends InvisibleAction {

    public static final int QUEUE_ID_UNKNOWN = -1;

    private int queueId;

    public QueueIDTrackerAction(int queueId) {
        this.queueId = queueId;
    }

    public int getQueueId() {
        return queueId;
    }

    /**
     * Get the original queue identifier for a {@link Run} instance, if known.
     * <p/>
     * The queue identifier will not be known for builds built before queue identifier
     * tracking was introduced.
     *
     * @param run The {@link Run} instance.
     * @return The original queue identifier if known, otherwise {@link #QUEUE_ID_UNKNOWN}.
     */
    public static int getQueueID(@Nonnull Run run) {
        QueueIDTrackerAction idTracker = run.getAction(QueueIDTrackerAction.class);
        if (idTracker != null) {
            return idTracker.queueId;
        } else {
            return QUEUE_ID_UNKNOWN;
        }
    }
}
