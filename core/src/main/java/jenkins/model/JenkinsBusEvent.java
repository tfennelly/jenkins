/*
 * The MIT License
 *
 * Copyright (c) 2015, CloudBees, Inc.
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
package jenkins.model;

import hudson.model.Queue;
import hudson.model.Result;
import hudson.model.Run;
import net.sf.json.JSONObject;

import javax.annotation.Nonnull;
import java.util.Properties;

/**
 * Simple event implementation for the {@link jenkins.model.EventBus}.
 * <p>
 * The idea of these event is NOT to transmit every possible piece of information
 * that the receiver may want, as that would result in huge/bloated events. Instead,
 * the events are lightweight i.e. just waking interested parties up to the fact that
 * something has happened that may be of interest to them, supplying enough information
 * to allow the interested party to lookup the specific information they are interested
 * in.
 *
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 * @since FIXME
 */
public class JenkinsBusEvent extends Properties {

    private static final long serialVersionUID = 4147621317843356567L;

    public static @Nonnull JenkinsBusEvent newEvent(@Nonnull String eventType) {
        JenkinsBusEvent jenkinsBusEvent = new JenkinsBusEvent();
        jenkinsBusEvent.setProperty("type", eventType);
        return jenkinsBusEvent;
    }
    
    public static @Nonnull JenkinsBusEvent newEvent(@Nonnull String eventType, @Nonnull Object from) {
        JenkinsBusEvent jenkinsBusEvent = newEvent(eventType);

        jenkinsBusEvent.setProperty("from", from.getClass().getName());
        if (from instanceof Queue.Item) {
            setQueueItemInfo(jenkinsBusEvent, (Queue.Item) from);
        } else if (from instanceof hudson.model.Item) {
            setItemInfo(jenkinsBusEvent, (hudson.model.Item) from);
        }
        if (from instanceof Run) {
            setRunInfo(jenkinsBusEvent, (Run) from);
        }

        return jenkinsBusEvent;
    }

    private static void setItemInfo(JenkinsBusEvent jenkinsBusEvent, hudson.model.Item item) {
        jenkinsBusEvent.setProperty("name", item.getName());
        jenkinsBusEvent.setProperty("url", getUrl(item));
    }

    private static void setQueueItemInfo(JenkinsBusEvent jenkinsBusEvent, Queue.Item item) {
        jenkinsBusEvent.setProperty("runStatus", "queued");
        if (item.task != null) {
            jenkinsBusEvent.setProperty("jobName", item.task.getName());
        }
        jenkinsBusEvent.setProperty("url", getUrl(item));
        jenkinsBusEvent.setProperty("queueId", Long.toString(item.getId()));
        jenkinsBusEvent.setProperty("blocked", Boolean.toString(item.isBlocked()));
        jenkinsBusEvent.setProperty("buildable", Boolean.toString(item.isBuildable()));
    }

    private static void setRunInfo(JenkinsBusEvent jenkinsBusEvent, Run run) {
        jenkinsBusEvent.setProperty("runId", run.getId());
        jenkinsBusEvent.setProperty("runNumber", Integer.toString(run.getNumber()));
        jenkinsBusEvent.setProperty("queueId", Long.toString(run.getQueueId()));
        jenkinsBusEvent.setProperty("url", getUrl(run));
        
        Result result = run.getResult();
        if (result != null) {
            jenkinsBusEvent.setProperty("runStatus", "complete");
            jenkinsBusEvent.setProperty("runResult", result.toString());
        } else {
            jenkinsBusEvent.setProperty("runStatus", "running");            
        }
        jenkinsBusEvent.setProperty("jobName", run.getParent().getName());
    }
    
    private static String getUrl(Queue.Item item) {
        return item.getUrl();        
    }
    
    private static String getUrl(hudson.model.Item item) {
        return item.getUrl();        
    }

    private static String getUrl(Run run) {
        return run.getUrl();        
    }

    public String toString() {
        return toJSONObject().toString();
    }

    public JSONObject toJSONObject() {
        return JSONObject.fromObject(this);
    }
}
