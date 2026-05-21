
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 10000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes('429') || error.status === 429;
      
      if (isQuotaError) {
        const isDailyQuota = errorMsg.includes('RequestsPerDay') || errorMsg.includes('limit: 20');
        
        if (isDailyQuota) {
          console.error("Gemini API DAILY QUOTA EXHAUSTED. Fallback heuristics will be used for the remainder of the session.");
          throw new Error("DAILY_QUOTA_EXHAUSTED");
        }

        // Try to extract "please retry in X.Xs" from the error message
        const match = errorMsg.match(/retry in ([\d.]+)s/);
        const retryAfterSeconds = match ? parseFloat(match[1]) : 0;
        
        // Wait at least the suggested time + a small buffer, or the backoff delay
        const backoffDelay = baseDelay * Math.pow(2, i);
        const waitTime = Math.max(retryAfterSeconds * 1000 + 1000, backoffDelay);
        
        console.warn(`Gemini API Quota Exceeded (RPM). Suggested wait: ${retryAfterSeconds}s. Actual wait: ${waitTime / 1000}s. (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}
