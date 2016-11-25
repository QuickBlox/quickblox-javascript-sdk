//
//  ========================================================================
//  Copyright (c) 1995-2015 Mort Bay Consulting Pty. Ltd.
//  ------------------------------------------------------------------------
//  All rights reserved. This program and the accompanying materials
//  are made available under the terms of the Eclipse Public License v1.0
//  and Apache License v2.0 which accompanies this distribution.
//
//      The Eclipse Public License is available at
//      http://www.eclipse.org/legal/epl-v10.html
//
//      The Apache License v2.0 is available at
//      http://www.opensource.org/licenses/apache2.0.php
//
//  You may elect to redistribute this code under either of these licenses.
//  ========================================================================
//

package org.eclipse.jetty.websocket;

import org.eclipse.jetty.io.Buffer;

/* ------------------------------------------------------------ */
/**
 * Parser the WebSocket protocol.
 *
 * modified by KNOWLEDGECODE
 */
public interface WebSocketParser
{
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    public interface FrameHandler
    {
        void onFrame(byte flags, byte opcode, byte[] array, int offset, int length);
        void close(int code,String message);
    }

    Buffer getBuffer();

    /**
     * @return an indication of progress, normally bytes filled plus events parsed, or -1 for EOF
     */
    int parseNext();

    boolean isBufferEmpty();

    void fill(Buffer buffer);
}
