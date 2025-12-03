/**
 * Request Queue System
 * Handles burst traffic by queuing requests and processing them in order
 */

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  timestamp: number;
}

interface QueueConfig {
  maxConcurrent: number;     // Max concurrent executions
  maxQueueSize: number;      // Max items in queue
  timeoutMs: number;         // Request timeout
}

class RequestQueue<T = unknown> {
  private queue: QueuedRequest<T>[] = [];
  private activeCount = 0;
  private config: QueueConfig;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 10,
      maxQueueSize: config.maxQueueSize ?? 100,
      timeoutMs: config.timeoutMs ?? 30000,
    };
  }

  /**
   * Add request to queue
   */
  async enqueue(
    execute: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.config.maxQueueSize) {
        reject(new Error('Queue is full. Please try again later.'));
        return;
      }

      const request: QueuedRequest<T> = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        execute,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      };

      // Add to queue (sorted by priority, higher first)
      const insertIndex = this.queue.findIndex(r => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      // Set timeout
      setTimeout(() => {
        const index = this.queue.findIndex(r => r.id === request.id);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error('Request timeout'));
        }
      }, this.config.timeoutMs);

      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    while (
      this.queue.length > 0 && 
      this.activeCount < this.config.maxConcurrent
    ) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeCount++;

      try {
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        this.activeCount--;
        // Continue processing
        if (this.queue.length > 0) {
          setImmediate(() => this.processQueue());
        }
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeCount,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
    };
  }
}

// Singleton queues for different purposes
export const answerQueue = new RequestQueue({
  maxConcurrent: 20,   // 20 concurrent answer submissions
  maxQueueSize: 500,   // Queue up to 500 answers
  timeoutMs: 10000,    // 10 second timeout
});

export const examQueue = new RequestQueue({
  maxConcurrent: 10,   // 10 concurrent exam operations
  maxQueueSize: 100,
  timeoutMs: 15000,
});

export const reportQueue = new RequestQueue({
  maxConcurrent: 3,    // Only 3 concurrent report generations
  maxQueueSize: 20,
  timeoutMs: 60000,    // 1 minute for heavy reports
});

/**
 * Helper to wrap async function with queue
 */
export async function withQueue<T>(
  queue: RequestQueue<unknown>,
  fn: () => Promise<T>,
  priority: number = 0
): Promise<T> {
  return queue.enqueue(fn as () => Promise<unknown>, priority) as Promise<T>;
}
