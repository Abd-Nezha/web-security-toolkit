import time
from typing import Any, Optional

class SimpleCache:
    def __init__(self):
        self.storage = {}
        self.expiry = 600  # 10 minutes

    async def set(self, key: str, value: Any):
        self.storage[key] = {
            "data": value,
            "timestamp": time.time()
        }

    async def get(self, key: str) -> Optional[Any]:
        if key in self.storage:
            item = self.storage[key]
            if time.time() - item["timestamp"] < self.expiry:
                return item["data"]
            else:
                del self.storage[key]
        return None

cache_instance = SimpleCache()

# Helper functions used in services
async def cache_get(key: str):
    return await cache_instance.get(key)

async def cache_set(key: str, value: Any):
    await cache_instance.set(key, value)