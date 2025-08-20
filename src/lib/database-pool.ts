// V1.1: Database Connection Pool Implementation
// This utility provides connection pooling for Supabase clients to handle 100+ concurrent users efficiently

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Connection pool configuration
const POOL_CONFIG = {
  MAX_CONNECTIONS: 20, // Maximum concurrent connections
  CONNECTION_TIMEOUT: 2000, // 2 seconds timeout
  IDLE_TIMEOUT: 30000, // 30 seconds idle timeout
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
};

interface PooledConnection {
  client: SupabaseClient;
  lastUsed: number;
  isActive: boolean;
  errorCount: number;
}

class DatabaseConnectionPool {
  private pool: PooledConnection[] = [];
  private waitingQueue: Array<{
    resolve: (client: SupabaseClient) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private isInitialized = false;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  // Initialize the pool with Supabase clients
  private initializePool(): void {
    if (this.isInitialized) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for connection pool');
    }

    // Create initial pool connections
    for (let i = 0; i < POOL_CONFIG.MAX_CONNECTIONS; i++) {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false, // Don't persist sessions in pool connections
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            'X-Client-Info': `toptiermen-pool-${i}`,
            'X-Connection-Pool': 'true',
          },
        },
      });

      this.pool.push({
        client,
        lastUsed: Date.now(),
        isActive: false,
        errorCount: 0,
      });
    }

    this.isInitialized = true;
    console.log(`🔄 Database connection pool initialized with ${POOL_CONFIG.MAX_CONNECTIONS} connections`);
  }

  // Get a connection from the pool
  async getConnection(): Promise<SupabaseClient> {
    if (!this.isInitialized) {
      this.initializePool();
    }

    // Try to find an available connection
    const availableConnection = this.pool.find(conn => !conn.isActive);
    
    if (availableConnection) {
      availableConnection.isActive = true;
      availableConnection.lastUsed = Date.now();
      availableConnection.errorCount = 0;
      return availableConnection.client;
    }

    // If no connections available, wait in queue
    return new Promise<SupabaseClient>((resolve, reject) => {
      const queueItem = {
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.waitingQueue.push(queueItem);

      // Set timeout for waiting
      setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item === queueItem);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          reject(new Error('Database connection timeout - pool exhausted'));
        }
      }, POOL_CONFIG.CONNECTION_TIMEOUT);
    });
  }

  // Release a connection back to the pool
  releaseConnection(client: SupabaseClient): void {
    const connection = this.pool.find(conn => conn.client === client);
    if (connection) {
      connection.isActive = false;
      connection.lastUsed = Date.now();

      // Process waiting queue
      if (this.waitingQueue.length > 0) {
        const nextRequest = this.waitingQueue.shift();
        if (nextRequest) {
          connection.isActive = true;
          connection.lastUsed = Date.now();
          nextRequest.resolve(connection.client);
        }
      }
    }
  }

  // Mark a connection as having an error
  markConnectionError(client: SupabaseClient, error: Error): void {
    const connection = this.pool.find(conn => conn.client === client);
    if (connection) {
      connection.errorCount++;
      connection.isActive = false;
      connection.lastUsed = Date.now();

      console.warn(`⚠️ Database connection error (count: ${connection.errorCount}):`, error.message);

      // If too many errors, replace the connection
      if (connection.errorCount >= 5) {
        this.replaceConnection(connection);
      }

      // Process waiting queue
      if (this.waitingQueue.length > 0) {
        const nextRequest = this.waitingQueue.shift();
        if (nextRequest) {
          const availableConnection = this.pool.find(conn => !conn.isActive);
          if (availableConnection) {
            availableConnection.isActive = true;
            availableConnection.lastUsed = Date.now();
            nextRequest.resolve(availableConnection.client);
          }
        }
      }
    }
  }

  // Replace a faulty connection
  private replaceConnection(connection: PooledConnection): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return;

    const newClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'toptiermen-pool-replacement',
          'X-Connection-Pool': 'true',
        },
      },
    });

    connection.client = newClient;
    connection.errorCount = 0;
    connection.isActive = false;
    connection.lastUsed = Date.now();

    console.log('🔄 Replaced faulty database connection');
  }

  // Cleanup idle connections
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      this.pool.forEach(connection => {
        if (!connection.isActive && 
            (now - connection.lastUsed) > POOL_CONFIG.IDLE_TIMEOUT) {
          connection.lastUsed = now;
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} idle database connections`);
      }
    }, 60000); // Check every minute
  }

  // Get pool statistics
  getPoolStats() {
    const activeConnections = this.pool.filter(conn => conn.isActive).length;
    const idleConnections = this.pool.filter(conn => !conn.isActive).length;
    const waitingRequests = this.waitingQueue.length;
    const totalErrors = this.pool.reduce((sum, conn) => sum + conn.errorCount, 0);

    return {
      totalConnections: this.pool.length,
      activeConnections,
      idleConnections,
      waitingRequests,
      totalErrors,
      poolUtilization: (activeConnections / this.pool.length) * 100,
    };
  }

  // Shutdown the pool
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.pool = [];
    this.waitingQueue = [];
    this.isInitialized = false;
    
    console.log('🔄 Database connection pool shutdown');
  }
}

// Create singleton instance
const databasePool = new DatabaseConnectionPool();

// Utility function to execute database operations with connection pooling
export async function withDatabaseConnection<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  let connection: SupabaseClient | null = null;
  
  try {
    // Get connection from pool
    connection = await databasePool.getConnection();
    
    // Execute operation with retry logic
    for (let attempt = 1; attempt <= POOL_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await operation(connection);
        return result;
      } catch (error) {
        if (attempt === POOL_CONFIG.RETRY_ATTEMPTS) {
          throw error;
        }
        
        // Mark connection as having an error
        databasePool.markConnectionError(connection, error as Error);
        
        // Get a new connection for retry
        connection = await databasePool.getConnection();
        
        // Exponential backoff
        const delay = POOL_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retry attempts exceeded');
  } finally {
    // Always release connection back to pool
    if (connection) {
      databasePool.releaseConnection(connection);
    }
  }
}

// Export pool instance for monitoring
export { databasePool };

// Export pool stats for debugging
export function getDatabasePoolStats() {
  return databasePool.getPoolStats();
}

// Export shutdown function
export function shutdownDatabasePool() {
  databasePool.shutdown();
}
