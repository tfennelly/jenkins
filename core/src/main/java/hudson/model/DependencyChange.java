/*
 * Copyright (C) 2013 CloudBees Inc.
 *
 * All rights reserved.
 */
package hudson.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a change in the dependency.
 */
public final class DependencyChange {
    /**
     * The dependency project.
     */
    public final Job project;
    /**
     * Version of the dependency project used in the previous build.
     */
    public final int fromId;
    /**
     * {@link hudson.model.Build} object for {@link #fromId}. Can be null if the log is gone.
     */
    public final Run from;
    /**
     * Version of the dependency project used in this build.
     */
    public final int toId;

    public final Run to;

    public DependencyChange(Job<?, ?> project, int fromId, int toId) {
        this.project = project;
        this.fromId = fromId;
        this.toId = toId;
        this.from = project.getBuildByNumber(fromId);
        this.to = project.getBuildByNumber(toId);
    }

    /**
     * Gets the {@link hudson.model.Run} objects (fromId,toId].
     * <p>
     * This method returns all such available builds in the ascending order
     * of IDs, but due to log rotations, some builds may be already unavailable.
     */
    public List<Run> getBuilds() {
        List<Run> r = new ArrayList<Run>();

        Run<?,?> b = project.getNearestBuild(fromId);
        if (b!=null && b.getNumber()==fromId)
            b = b.getNextBuild(); // fromId exclusive

        while (b!=null && b.getNumber()<=toId) {
            r.add(b);
            b = b.getNextBuild();
        }

        return r;
    }
}
