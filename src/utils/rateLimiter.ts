export class RateLimiter {
  private limit: number;
  private interval: number;
  private timestamps: number[];

  constructor(limit: number, interval: number) {
    this.limit = limit; // Maximum allowed requests
    this.interval = interval; // Time window in milliseconds
    this.timestamps = [];
  }

  public allowRequest(): boolean {
    const now = Date.now();

    // Remove timestamps that are older than the interval window
    while (
      this.timestamps.length > 0 &&
      this.timestamps[0] <= now - this.interval
    ) {
      this.timestamps.shift();
    }

    // If the number of requests within the window is less than the limit,
    // permit the new request.
    if (this.timestamps.length < this.limit) {
      this.timestamps.push(now);
      return true;
    }

    // Otherwise, reject the request.
    return false;
  }
}
