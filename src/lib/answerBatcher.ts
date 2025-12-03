/**
 * Answer Batching System
 * Collects multiple answer submissions and writes them in batch to reduce DB load
 */

import { prisma } from './prisma';

interface PendingAnswer {
  examResultId: string;
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize: number;     // Max answers before forced flush
  flushIntervalMs: number;  // Interval to flush pending answers
  maxWaitMs: number;        // Max time an answer can wait before flush
}

class AnswerBatcher {
  private pending: Map<string, PendingAnswer> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private config: BatchConfig;
  private isProcessing = false;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize ?? 50,
      flushIntervalMs: config.flushIntervalMs ?? 2000,  // 2 seconds
      maxWaitMs: config.maxWaitMs ?? 5000,              // 5 seconds max wait
    };

    this.startFlushTimer();
  }

  /**
   * Add answer to batch
   * Returns immediately, answer will be persisted asynchronously
   */
  async addAnswer(answer: Omit<PendingAnswer, 'timestamp'>): Promise<void> {
    const key = `${answer.examResultId}:${answer.questionId}`;
    
    this.pending.set(key, {
      ...answer,
      timestamp: Date.now(),
    });

    // Check if we should flush immediately
    if (this.pending.size >= this.config.maxBatchSize) {
      await this.flush();
    }
  }

  /**
   * Add multiple answers at once
   */
  async addAnswers(answers: Omit<PendingAnswer, 'timestamp'>[]): Promise<void> {
    const now = Date.now();
    
    for (const answer of answers) {
      const key = `${answer.examResultId}:${answer.questionId}`;
      this.pending.set(key, {
        ...answer,
        timestamp: now,
      });
    }

    if (this.pending.size >= this.config.maxBatchSize) {
      await this.flush();
    }
  }

  /**
   * Flush all pending answers to database
   */
  async flush(): Promise<number> {
    if (this.pending.size === 0 || this.isProcessing) {
      return 0;
    }

    this.isProcessing = true;
    const toProcess = new Map(this.pending);
    this.pending.clear();

    try {
      const answers = Array.from(toProcess.values());
      
      // Use upsert to handle updates to existing answers
      const operations = answers.map(answer => 
        prisma.answer.upsert({
          where: {
            examResultId_questionId: {
              examResultId: answer.examResultId,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
          },
          create: {
            examResultId: answer.examResultId,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
          },
        })
      );

      // Execute in transaction for atomicity
      await prisma.$transaction(operations);
      
      return answers.length;
    } catch (error) {
      // On error, put answers back in pending queue
      for (const [key, answer] of toProcess.entries()) {
        if (!this.pending.has(key)) {
          this.pending.set(key, answer);
        }
      }
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force flush for specific exam result (when user submits exam)
   */
  async flushForExamResult(examResultId: string): Promise<number> {
    const toFlush: PendingAnswer[] = [];
    
    for (const [key, answer] of this.pending.entries()) {
      if (answer.examResultId === examResultId) {
        toFlush.push(answer);
        this.pending.delete(key);
      }
    }

    if (toFlush.length === 0) {
      return 0;
    }

    const operations = toFlush.map(answer => 
      prisma.answer.upsert({
        where: {
          examResultId_questionId: {
            examResultId: answer.examResultId,
            questionId: answer.questionId,
          },
        },
        update: {
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
        },
        create: {
          examResultId: answer.examResultId,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
        },
      })
    );

    await prisma.$transaction(operations);
    return toFlush.length;
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      // Check for answers that have waited too long
      const now = Date.now();
      const hasOldAnswers = Array.from(this.pending.values())
        .some(a => now - a.timestamp > this.config.maxWaitMs);

      if (hasOldAnswers || this.pending.size > 0) {
        try {
          await this.flush();
        } catch (error) {
          console.error('Answer batch flush error:', error);
        }
      }
    }, this.config.flushIntervalMs);

    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Get pending count for monitoring
   */
  getPendingCount(): number {
    return this.pending.size;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      pendingCount: this.pending.size,
      isProcessing: this.isProcessing,
      config: this.config,
    };
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    if (this.pending.size > 0) {
      await this.flush();
    }
  }
}

// Singleton instance
export const answerBatcher = new AnswerBatcher({
  maxBatchSize: 50,
  flushIntervalMs: 2000,
  maxWaitMs: 5000,
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await answerBatcher.destroy();
});
