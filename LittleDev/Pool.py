import multiprocessing
import threading
import signal

class ThreadPool(object):
    """A universal threadpool with some extended functionality"""
    def __init__(self, size=0):
        super(ThreadPool, self).__init__()
        if size < 1:
            size = multiprocessing.cpu_count()
        self.size = size
        self.threads = []
        self.queue = Queue(self)
        self.isRunning = True

        for i in range(0, size):
            self.threads.append(PoolWorker(self))
            self.threads[i].start()
    def submit(self, fn, *args):
        self.queue.add(fn, *args)
    def join(self):
        self.isRunning = False

        self.queue.cv.acquire()
        self.queue.cv.notifyAll()
        self.queue.cv.release()
        
        for t in self.threads:
            self.queue.cv.acquire()
            self.queue.cv.notifyAll()
            self.queue.cv.release()
            t.join()

class Queue(object):
    def __init__(self, pool):
        self.queue = []
        self.cv = threading.Condition()
        self.pool = pool
    """ Adds a item, thread safe """
    def add(self, fn, *args):
        item = { "fn": fn, "args": args }
        self.cv.acquire()
        self.queue.append(item)
        self.cv.notify()
        self.cv.release()
    """ Gets a item, not thread safe. Should be wrapped arround an cv """ 
    def get(self):
        self.cv.acquire()
        while self.isEmpty():
            self.cv.wait()
            if not self.pool.isRunning:
                self.cv.release()
                return
        item = self.queue.pop(0)
        self.cv.release()
        return item
    def isEmpty(self):
        return len(self.queue) < 1

def nops(signum, frame):
    print "nops"
    pass

class PoolWorker(threading.Thread):
    """A worker within a threadpool"""
    def __init__(self, pool):
        super(PoolWorker, self).__init__()
        self.pool = pool
    def run(self):
        while self.pool.isRunning:
            item = self.pool.queue.get()
            if(item !=  None):
                item["fn"](*(item["args"]))