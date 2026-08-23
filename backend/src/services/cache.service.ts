import Redis from 'ioredis';

interface MemoryCacheItem {
  value: any;
  expiresAt: number | null;
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, MemoryCacheItem> = new Map();
  private isUsingRedis: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}` : null;

    if (redisUrl || process.env.NODE_ENV === 'production') {
      try {
        const client = new Redis(redisUrl || 'redis://127.0.0.1:6379', {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          retryStrategy(times) {
            if (times > 2) return null; // Não trava se o Redis não estiver instalado localmente
            return Math.min(times * 200, 1000);
          },
          lazyConnect: true
        });

        client.connect()
          .then(() => {
            this.redis = client;
            this.isUsingRedis = true;
            console.log('⚡ [Redis] Conexão com Redis estabelecida com sucesso! Camada de Cache ativa.');
          })
          .catch(() => {
            this.isUsingRedis = false;
            this.redis = null;
            console.log('💡 [Cache] Redis não detectado na máquina local. Operando com Cache em Memória de Alta Velocidade (In-Memory com TTL).');
          });

        client.on('error', () => {
          this.isUsingRedis = false;
        });
      } catch (err) {
        this.isUsingRedis = false;
        console.log('💡 [Cache] Operando em modo de Cache em Memória Local.');
      }
    } else {
      console.log('💡 [Cache] Camada de Cache Ultra-Rápida Ativa (In-Memory com suporte a Redis transparente).');
    }

    // Limpeza periódica do cache em memória (a cada 60s)
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.expiresAt && item.expiresAt <= now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000);
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.isUsingRedis && this.redis) {
      try {
        const data = await this.redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      } catch (e) {
        // Fallback silencioso para memória se Redis falhar
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    if (this.isUsingRedis && this.redis) {
      try {
        const serialized = JSON.stringify(value);
        if (ttlSeconds > 0) {
          await this.redis.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, serialized);
        }
        return;
      } catch (e) {
        // Fallback
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null
    });
  }

  public async del(key: string): Promise<void> {
    if (this.isUsingRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch (e) {}
    }
    this.memoryCache.delete(key);
  }

  public async delPrefix(prefix: string): Promise<void> {
    if (this.isUsingRedis && this.redis) {
      try {
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (e) {}
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  public getStatus(): { mode: 'REDIS' | 'IN_MEMORY'; keysCount: number } {
    return {
      mode: this.isUsingRedis ? 'REDIS' : 'IN_MEMORY',
      keysCount: this.memoryCache.size
    };
  }
}

export const cache = new CacheService();
