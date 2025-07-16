// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      this.metrics.get(operation)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(operation)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getAverageTime(operation: string): number {
    const measurements = this.metrics.get(operation);
    if (!measurements || measurements.length === 0) {
      return 0;
    }
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [operation] of this.metrics.entries()) {
      result[operation] = this.getAverageTime(operation);
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Utility function to measure API performance
export const measureApiPerformance = async <T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  const endTimer = monitor.startTimer(operation);
  
  try {
    const result = await apiCall();
    return result;
  } finally {
    endTimer();
  }
}; 