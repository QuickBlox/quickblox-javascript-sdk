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

package org.eclipse.jetty.util;

import java.util.AbstractList;
import java.util.Collection;
import java.util.NoSuchElementException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;


/* ------------------------------------------------------------ */
/** Queue backed by a circular array.
 *
 * This queue is uses  a variant of the two lock queue algorithm to
 * provide an efficient queue or list backed by a growable circular
 * array.  This queue also has a partial implementation of
 * {@link java.util.concurrent.BlockingQueue}, specifically the {@link #take()} and
 * {@link #poll(long, TimeUnit)} methods.
 * Unlike {@link java.util.concurrent.ArrayBlockingQueue}, this class is
 * able to grow and provides a blocking put call.
 * <p>
 * The queue has both a capacity (the size of the array currently allocated)
 * and a limit (the maximum size that may be allocated), which defaults to
 * {@link Integer#MAX_VALUE}.
 *
 * @param <E> The element type
 */
public class BlockingArrayQueue<E> extends AbstractList<E> implements BlockingQueue<E>
{
    public final int DEFAULT_CAPACITY=128;
    public final int DEFAULT_GROWTH=64;
    private final int _limit;
    private final AtomicInteger _size=new AtomicInteger();
    private final int _growCapacity;

    private volatile int _capacity;
    private Object[] _elements;

    private final ReentrantLock _headLock = new ReentrantLock();
    private final Condition _notEmpty = _headLock.newCondition();
    private int _head;

    private final ReentrantLock _tailLock = new ReentrantLock();
    private int _tail;

    /* ------------------------------------------------------------ */
    /** Create a growing partially blocking Queue.
     * @param capacity Initial capacity
     * @param growBy Incremental capacity.
     */
    public BlockingArrayQueue(int capacity,int growBy)
    {
        _elements=new Object[capacity];
        _capacity=_elements.length;
        _growCapacity=growBy;
        _limit=Integer.MAX_VALUE;
    }

    /* ------------------------------------------------------------ */
    public int getCapacity()
    {
        return _capacity;
    }

    /* ------------------------------------------------------------ */
    @Override
    public boolean add(E e)
    {
        return offer(e);
    }

    /* ------------------------------------------------------------ */
    public E element()
    {
        E e = peek();
        if (e==null)
            throw new NoSuchElementException();
        return e;
    }

    /* ------------------------------------------------------------ */
    @SuppressWarnings("unchecked")
    public E peek()
    {
        if (_size.get() == 0)
            return null;

        E e = null;
        _headLock.lock(); // Size cannot shrink
        try
        {
            if (_size.get() > 0)
                e = (E)_elements[_head];
        }
        finally
        {
            _headLock.unlock();
        }

        return e;
    }

    /* ------------------------------------------------------------ */
    public boolean offer(E e)
    {
        if (e == null)
            throw new NullPointerException();

        boolean not_empty=false;
        _tailLock.lock();  // size cannot grow... only shrink
        try
        {
            if (_size.get() >= _limit)
                return false;

            // should we expand array?
            if (_size.get()==_capacity)
            {
                _headLock.lock();   // Need to grow array
                try
                {
                    if (!grow())
                        return false;
                }
                finally
                {
                    _headLock.unlock();
                }
            }

            // add the element
            _elements[_tail]=e;
            _tail=(_tail+1)%_capacity;

            not_empty=0==_size.getAndIncrement();

        }
        finally
        {
            _tailLock.unlock();
        }

        if (not_empty)
        {
            _headLock.lock();
            try
            {
                _notEmpty.signal();
            }
            finally
            {
                _headLock.unlock();
            }
        }

        return true;
    }

    /* ------------------------------------------------------------ */
    @SuppressWarnings("unchecked")
    public E poll()
    {
        if (_size.get() == 0)
            return null;

        E e = null;
        _headLock.lock(); // Size cannot shrink
        try
        {
            if (_size.get() > 0)
            {
                final int head=_head;
                e = (E)_elements[head];
                _elements[head]=null;
                _head=(head+1)%_capacity;

                if (_size.decrementAndGet()>0)
                    _notEmpty.signal();
            }
        }
        finally
        {
            _headLock.unlock();
        }

        return e;
    }

    /* ------------------------------------------------------------ */
    /**
     * Retrieves and removes the head of this queue, waiting
     * if no elements are present on this queue.
     * @return the head of this queue
     * @throws InterruptedException if interrupted while waiting.
     */
    @SuppressWarnings("unchecked")
    public E take() throws InterruptedException
    {
        E e = null;
        _headLock.lockInterruptibly();  // Size cannot shrink
        try
        {
            try
            {
                while (_size.get() == 0)
                {
                    _notEmpty.await();
                }
            }
            catch (InterruptedException ie)
            {
                _notEmpty.signal();
                throw ie;
            }

            final int head=_head;
            e = (E)_elements[head];
            _elements[head]=null;
            _head=(head+1)%_capacity;

            if (_size.decrementAndGet()>0)
                _notEmpty.signal();
        }
        finally
        {
            _headLock.unlock();
        }

        return e;
    }

    /* ------------------------------------------------------------ */
    /**
     * Retrieves and removes the head of this queue, waiting
     * if necessary up to the specified wait time if no elements are
     * present on this queue.
     * @param time how long to wait before giving up, in units of
     * <tt>unit</tt>
     * @param unit a <tt>TimeUnit</tt> determining how to interpret the
     * <tt>timeout</tt> parameter
     * @return the head of this queue, or <tt>null</tt> if the
     * specified waiting time elapses before an element is present.
     * @throws InterruptedException if interrupted while waiting.
     */
    @SuppressWarnings("unchecked")
    public E poll(long time, TimeUnit unit) throws InterruptedException
    {

        E e = null;

        long nanos = unit.toNanos(time);

        _headLock.lockInterruptibly(); // Size cannot shrink
        try
        {
            try
            {
                while (_size.get() == 0)
                {
                    if (nanos<=0)
                        return null;
                    nanos = _notEmpty.awaitNanos(nanos);
                }
            }
            catch (InterruptedException ie)
            {
                _notEmpty.signal();
                throw ie;
            }

            e = (E)_elements[_head];
            _elements[_head]=null;
            _head=(_head+1)%_capacity;

            if (_size.decrementAndGet()>0)
                _notEmpty.signal();
        }
        finally
        {
            _headLock.unlock();
        }

        return e;
    }

    /* ------------------------------------------------------------ */
    public E remove()
    {
        E e=poll();
        if (e==null)
            throw new NoSuchElementException();
        return e;
    }

    /* ------------------------------------------------------------ */
    @Override
    public void clear()
    {
        _tailLock.lock();
        try
        {
            _headLock.lock();
            try
            {
                _head=0;
                _tail=0;
                _size.set(0);
            }
            finally
            {
                _headLock.unlock();
            }
        }
        finally
        {
            _tailLock.unlock();
        }
    }

    /* ------------------------------------------------------------ */
    @Override
    public boolean isEmpty()
    {
        return _size.get()==0;
    }

    /* ------------------------------------------------------------ */
    @Override
    public int size()
    {
        return _size.get();
    }

    /* ------------------------------------------------------------ */
    @SuppressWarnings("unchecked")
    @Override
    public E get(int index)
    {
        _tailLock.lock();
        try
        {
            _headLock.lock();
            try
            {
                if (index<0 || index>=_size.get())
                    throw new IndexOutOfBoundsException("!("+0+"<"+index+"<="+_size+")");
                int i = _head+index;
                if (i>=_capacity)
                    i-=_capacity;
                return (E)_elements[i];
            }
            finally
            {
                _headLock.unlock();
            }
        }
        finally
        {
            _tailLock.unlock();
        }
    }

    /* ------------------------------------------------------------ */
    private boolean grow()
    {
        if (_growCapacity<=0)
            return false;

        _tailLock.lock();
        try
        {
            _headLock.lock();
            try
            {
                final int head=_head;
                final int tail=_tail;
                final int new_tail;

                Object[] elements=new Object[_capacity+_growCapacity];

                if (head<tail)
                {
                    new_tail=tail-head;
                    System.arraycopy(_elements,head,elements,0,new_tail);
                }
                else if (head>tail || _size.get()>0)
                {
                    new_tail=_capacity+tail-head;
                    int cut=_capacity-head;
                    System.arraycopy(_elements,head,elements,0,cut);
                    System.arraycopy(_elements,0,elements,cut,tail);
                }
                else
                {
                    new_tail=0;
                }

                _elements=elements;
                _capacity=_elements.length;
                _head=0;
                _tail=new_tail;
                return true;
            }
            finally
            {
                _headLock.unlock();
            }
        }
        finally
        {
            _tailLock.unlock();
        }

    }

    /* ------------------------------------------------------------ */
    public int drainTo(Collection<? super E> c)
    {
        throw new UnsupportedOperationException();
    }

    /* ------------------------------------------------------------ */
    public int drainTo(Collection<? super E> c, int maxElements)
    {
        throw new UnsupportedOperationException();
    }

    /* ------------------------------------------------------------ */
    public boolean offer(E o, long timeout, TimeUnit unit) throws InterruptedException
    {
        throw new UnsupportedOperationException();
    }

    /* ------------------------------------------------------------ */
    public void put(E o) throws InterruptedException
    {
        if (!add(o))
            throw new IllegalStateException("full");
    }

    /* ------------------------------------------------------------ */
    public int remainingCapacity()
    {
        _tailLock.lock();
        try
        {
            _headLock.lock();
            try
            {
                return getCapacity()-size();
            }
            finally
            {
                _headLock.unlock();
            }
        }
        finally
        {
            _tailLock.unlock();
        }
    }
}
