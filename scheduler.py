import threading
import time
import bisect

class Scheduler(threading.Thread):
    def __init__(self):
        self.queue = []
        self.isRunning = False
        self.cv = threading.Condition()
    def add(self, item):
        self.cv.acquire()
        bisect.insort_right(self.queue, item)
        self.cv.notify()
        self.cv.release()
    def run(self):
        self.isRunning = True

        # Wait if no items are present
        while self.isRunning:
            while len(self.queue) < 1:
                self.cv.acquire()
                self.cv.wait()
                self.cv.release()
                if not self.isRunning:
                    return;

        self.cv.acquire()
        item = queue.pop(0)
        self.cv.release()
        item.process()



class ScheduleItem:
    def __init__(self):
        self.executeAt    = time.time()
        self.executeEvery = -1
        # TODO execution command
    def process(self):
        pass