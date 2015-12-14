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

import hudson.security.Permission;
import jenkins.eventbus.EventBusException;
import jenkins.eventbus.EventBusServer;
import jenkins.eventbus.EventConsumer;
import jenkins.eventbus.PubSubEventPublisher;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class EventBus {

    // See https://github.com/tfennelly/jenkins-event-bus
    private EventBusServer eventBusServer;

    private Map<String, PubSubEventPublisher> publishers = new ConcurrentHashMap<String, PubSubEventPublisher>();

    private EventBus() {
    }

    synchronized static @Nonnull EventBus start() throws EventBusException {
        EventBus eventBus = new EventBus();
        eventBus.eventBusServer = new EventBusServer();
        eventBus.eventBusServer.start();
        return eventBus;
    }

    void stop() {
        eventBusServer.stop();
    }

    public @Nonnull PubSubEventPublisher newPubSubEventPublisher(@Nonnull String eventName, @Nonnull String description) {
        return newPubSubEventPublisher(eventName, description, Permission.READ);
    }

    public @Nonnull PubSubEventPublisher newPubSubEventPublisher(@Nonnull String eventName, @Nonnull String description, @Nonnull Permission permission) {
        PubSubEventPublisher publisher = eventBusServer.newPubSubEventPublisher(eventName);

        publisher.start();
        publishers.put(eventName, publisher);

        // TODO: Permissions .... delivery of events to client-side needs to be secured.
        // TODO: Event discovery ... an API and UI page that allows you to see what events are being published (hence the "description" arg).

        return publisher;
    }

    public @CheckForNull PubSubEventPublisher getPubSubEventPublisher(@Nonnull String eventName) {
        return publishers.get(eventName);
    }

    public boolean onPubSubEvent(@Nonnull String eventName, @Nonnull EventConsumer eventConsumer) {
        return eventBusServer.onPubSubEvent(eventName, eventConsumer);
    }

    public boolean onPubSubEvent(@Nonnull String eventName, @Nonnull Properties eventProperties, @Nonnull EventConsumer eventConsumer) {
        return eventBusServer.onPubSubEvent(eventName, eventProperties, eventConsumer);
    }

    public void offPubSubEvent(@Nonnull EventConsumer eventConsumer) {
        eventBusServer.offPubSubEvent(eventConsumer);
    }
}