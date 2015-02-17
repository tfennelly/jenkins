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
package hudson.widgets;

import hudson.model.Queue;
import hudson.model.Run;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * History page.
 *
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class HistoryPage<T> {

    private final int maxEntries;
    private final Long newerThan;
    private final Long olderThan;

    // Need to use different Lists for Queue.Items and Runs because
    // we need access to them separately in the jelly files for rendering.
    // TODO: unless there's a way of using a single list and then defining separate jelly files by class type? Though that's just moving the problem/confusion somewhere else.
    public final List<Queue.Item> queueItems = new ArrayList<Queue.Item>();
    public final List<Run> runs = new ArrayList<Run>();

    public boolean hasUpPage = false; // there are also newer builds than on this page
    public boolean hasDownPage = false; // there are also older builds than on this page

    public long newestOnPage = Long.MIN_VALUE; // see updateNewestOldest()
    public long oldestOnPage = Long.MAX_VALUE; // see updateNewestOldest()

    /**
     * Create a history page.
     *
     * @param maxEntries The max number of entries allowed for the page.
     * @param newerThan Queue IDs newer/greater than this queue ID take precedence on this page. <strong>Should not be set
     *                  if setting the {@code olderThan} parameter.</strong>
     * @param olderThan Queue IDs older/less than this queue ID take precedence on this page. <strong>Should not be set if
     *                  setting the {@code newerThan} parameter (will be ignored).</strong>
     */
    public HistoryPage(int maxEntries, Long newerThan, Long olderThan) {
        this.maxEntries = maxEntries;
        this.newerThan = newerThan;
        this.olderThan = olderThan;
    }

    /**
     * Add build items to the History page.
     * @param items The items to be added. Assumes the list of items are in descending queue ID order i.e. newest first.
     */
    public void add(@Nonnull List<T> items) {
        if (items.isEmpty()) {
            return;
        }

        sort(items);
        if (newerThan == null && olderThan == null) {
            // Just return the first page of entries (newest)
            for (T item : items) {
                add(item);
                if (isFull()) {
                    break;
                }
            }
            hasDownPage = (items.size() > maxEntries);
        } else if (newerThan != null) {
            int toFillCount = getFillCount();
            if (toFillCount > 0) {
                // Locate the point in the items list where the 'newerThan' build item is. Once located,
                // add a max of 'getFillCount' build items before that build item.
                long newestInList = getQueueId(items.get(0));
                long oldestInList = getQueueId(items.get(items.size() - 1));
                int newerThanIdx = -1;

                if (newerThan > newestInList) {
                    // Nothing newer
                } else if (newerThan >= oldestInList) {
                    // newerThan is within the range of items in the item list.
                    // go through the list and locate the cut-off point.
                    for (int i = 0; i < items.size(); i++) {
                        T item = items.get(i);
                        if (getQueueId(item) <= newerThan) {
                            newerThanIdx = i;
                            break;
                        }
                    }
                } else if (newerThan < oldestInList) {
                    newerThanIdx = items.size();
                }

                if (newerThanIdx != -1) {
                    if (newerThanIdx < maxEntries) {
                        // If there's less than a full page of items newer than "newerThan", then it's ok to
                        // fill the page with items older than "newerThan".
                        int itemCountToAdd = Math.min(toFillCount, items.size());
                        for (int i = 0; i < itemCountToAdd; i++) {
                            add(items.get(i));
                        }
                    } else {
                        // There's more than a full page of items newer than "newerThan".
                        for (int i = (newerThanIdx - toFillCount); i < newerThanIdx; i++) {
                            add(items.get(i));
                        }
                        hasUpPage = true;
                    }
                    // if there are items after the "newerThan" item, then we
                    // can page down.
                    hasDownPage = (items.size() > newerThanIdx + 1);
                } else {
                    // All builds are older than newerThan ?
                    hasDownPage = true;
                }
            }
        } else if (olderThan != null) {
            for (int i = 0; i < items.size(); i++) {
                T item = items.get(i);
                if (getQueueId(item) >= olderThan) {
                    hasUpPage = true;
                } else {
                    add(item);
                    if (isFull()) {
                        // This page is full but there may be more builds older
                        // than the oldest on this page.
                        hasDownPage = (i + 1 < items.size());
                        break;
                    }
                }
            }
        }
    }

    private void sort(List<T> items) {
        // Queue items can start building out of order with how they got added to the queue. Sorting them
        // before adding to the page. They'll still get displayed before the building items coz they end
        // up in a different list in HistoryPage.
        final HistoryPage thisPage = this;
        Collections.sort(items, new Comparator<T>() {
            @Override
            public int compare(T o1, T o2) {
                long o1QID = thisPage.getQueueId(o1);
                long o2QID = thisPage.getQueueId(o2);

                if (o1QID < o2QID) {
                    return 1;
                } else if (o1QID == o2QID) {
                    return 0;
                } else {
                    return -1;
                }
            }
        });
    }

    protected long getQueueId(@Nonnull T entry) {
        if (entry instanceof Queue.Item) {
            return ((Queue.Item) entry).id;
        } else if (entry instanceof Run) {
            return ((Run) entry).getQueueId();
        } else {
            return Run.QUEUE_ID_UNKNOWN;
        }
    }

    private void addQueueItem(Queue.Item item) {
        updateNewestOldest(item.id);
        queueItems.add(item);
    }

    private void addRun(Run run) {
        updateNewestOldest(run.getQueueId());
        runs.add(run);
    }

    private void updateNewestOldest(long queueId) {
        newestOnPage = Math.max(newestOnPage, queueId);
        oldestOnPage = Math.min(oldestOnPage, queueId);
    }

    private boolean add(T entry) {
        // Purposely not calling isFull(). May need to add a greater number of entries
        // to the page initially, newerThan then cutting it back down to size using cutLeading()
        if (entry instanceof Queue.Item) {
            addQueueItem((Queue.Item) entry);
            return true;
        } else if (entry instanceof Run) {
            addRun((Run) entry);
            return true;
        }
        return false;
    }

    private boolean isFull() {
        return (size() >= maxEntries);
    }

    /**
     * Get the number of items required to fill the page.
     * @return The number of items required to fill the page.
     */
    private int getFillCount() {
        return Math.max(0, (maxEntries - size()));
    }

    private int size() {
        return queueItems.size() + runs.size();
    }
}
