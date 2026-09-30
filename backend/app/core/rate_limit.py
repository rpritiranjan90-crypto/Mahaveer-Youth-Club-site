import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List, Tuple


class LoginRateLimiter:
    """
    Thread-safe in-memory sliding window rate limiter for login brute-force prevention.
    Tracks failed attempts by (ip_address, email_key).
    """

    def __init__(self, max_attempts: int = 5, window_seconds: int = 300):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._lock = Lock()
        # Key: (ip, normalized_email) -> List[timestamp]
        self._attempts: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def _normalize_key(self, ip_address: str, email: str) -> Tuple[str, str]:
        return (ip_address.strip(), email.strip().lower())

    def _cleanup_old_attempts(self, now: float, timestamps: List[float]) -> List[float]:
        cutoff = now - self.window_seconds
        return [ts for ts in timestamps if ts > cutoff]

    def is_allowed(self, ip_address: str, email: str) -> bool:
        """
        Returns True if the client/account is under the rate limit threshold.
        """
        now = time.time()
        key = self._normalize_key(ip_address, email)

        with self._lock:
            active_attempts = self._cleanup_old_attempts(now, self._attempts[key])
            self._attempts[key] = active_attempts
            return len(active_attempts) < self.max_attempts

    def record_failed_attempt(self, ip_address: str, email: str) -> None:
        """
        Records a failed authentication attempt.
        """
        now = time.time()
        key = self._normalize_key(ip_address, email)

        with self._lock:
            active_attempts = self._cleanup_old_attempts(now, self._attempts[key])
            active_attempts.append(now)
            self._attempts[key] = active_attempts

    def reset(self, ip_address: str, email: str) -> None:
        """
        Resets failed attempt history upon successful authentication.
        """
        key = self._normalize_key(ip_address, email)
        with self._lock:
            self._attempts.pop(key, None)

    def clear_all(self) -> None:
        """
        Clears all rate limit state (useful for test isolation).
        """
        with self._lock:
            self._attempts.clear()


# Global singleton rate limiter instance
login_rate_limiter = LoginRateLimiter(max_attempts=5, window_seconds=300)
