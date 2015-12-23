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

import org.apache.activemq.web.MessageListenerServletMixIn;
import org.kohsuke.stapler.Stapler;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author <a href="mailto:tom.fennelly@gmail.com">tom.fennelly@gmail.com</a>
 */
public class JenkinsServlet extends Stapler {

    private MessageListenerServletMixIn messageListenerServletMixIn;

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);
        messageListenerServletMixIn = new MessageListenerServletMixIn();
        messageListenerServletMixIn.init(servletConfig);
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse rsp) throws ServletException, IOException {
        String requestedResource = req.getRequestURI().substring(req.getContextPath().length());

        if (requestedResource.startsWith("/")) {
            requestedResource = requestedResource.substring(1);
        }

        String[] pathTokens = requestedResource.split("/");
        if (pathTokens.length > 0 && pathTokens[0].equals("jenkins-eventbus")) {
            messageListenerServletMixIn.service(req, rsp);
            return;
        }

        super.service(req, rsp);
    }

    @Override
    public void destroy() {
        try {
            messageListenerServletMixIn.destroy();
        } finally {
            super.destroy();
        }
    }
}