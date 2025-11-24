
import { Manuscript, User, INITIAL_MANUSCRIPTS } from '../types';

// Configuration for MongoDB Atlas Data API
// NOTE: Browsers CANNOT connect directly to MongoDB using 'mongodb://' strings.
// We use the HTTP-based Atlas Data API or fallback to LocalStorage for development.

const MONGO_URL = process.env.MONGO_URL; // e.g. https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
const API_KEY = process.env.MONGO_API_KEY;
const CLUSTER_NAME = process.env.MONGO_CLUSTER || 'Cluster0';
const DB_NAME = process.env.MONGO_DB_NAME || 'saraswati_db';

interface Filter {
  [key: string]: any;
}

class MongoCollection<T extends { id: string }> {
  private collectionName: string;
  private localKey: string;
  private initialData: T[];

  constructor(collectionName: string, initialData: T[] = []) {
    this.collectionName = collectionName;
    // Bumped version to v3 to clear default manuscripts and start fresh
    this.localKey = `saraswati_v3_${collectionName}`;
    this.initialData = initialData;
  }

  // Helper to simulate network latency for local experience
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- MongoDB Atlas Data API Connector ---
  private async request(action: string, body: any) {
    // Strictly require URL and Key to attempt network request
    if (!MONGO_URL || !API_KEY) return null;

    try {
        // Ensure URL doesn't end with slash to avoid double slashes
        const baseUrl = MONGO_URL.replace(/\/$/, "");
        const response = await fetch(`${baseUrl}/action/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify({
                dataSource: CLUSTER_NAME,
                database: DB_NAME,
                collection: this.collectionName,
                ...body
            })
        });

        if (!response.ok) {
            // If API fails (e.g. bad key), return null to trigger fallback
            console.warn(`MongoDB Data API Error: ${response.statusText}`);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        // Network error, return null to trigger fallback
        console.error("MongoDB Connection Failed:", error);
        return null;
    }
  }

  // --- CRUD Operations with LocalStorage Fallback ---

  async find(filter: Filter = {}): Promise<T[]> {
    // 1. Try Remote MongoDB
    const remoteData = await this.request('find', { filter });
    if (remoteData && remoteData.documents) {
        // Map MongoDB _id to application id if necessary
        return remoteData.documents.map((doc: any) => ({
            ...doc,
            id: doc.id || doc._id
        }));
    }

    // 2. Local Fallback (Default for Dev)
    await this.delay();
    try {
        let json = localStorage.getItem(this.localKey);
        
        // Initialize with seed data if empty or if array is empty
        // This ensures users always see the initial collection even if they cleared the list previously
        // NOTE: If initialData is empty (v3 update), this block is skipped, allowing purely empty starts.
        if ((!json || json === '[]') && this.initialData.length > 0) {
            json = JSON.stringify(this.initialData);
            localStorage.setItem(this.localKey, json);
        }

        const stored: T[] = json ? JSON.parse(json) : [];
        
        // Simple client-side filtering
        return stored.filter((item: any) => {
            return Object.entries(filter).every(([key, value]) => item[key] === value);
        });
    } catch (e) {
        console.error("Local storage read error", e);
        return [];
    }
  }

  async findOne(filter: Filter): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  async insertOne(document: T): Promise<boolean> {
    // 1. Try Remote MongoDB
    const remoteData = await this.request('insertOne', { document });
    if (remoteData) return true;

    // 2. Local Fallback
    await this.delay();
    try {
        const json = localStorage.getItem(this.localKey);
        const stored: T[] = json ? JSON.parse(json) : [];
        stored.push(document);
        localStorage.setItem(this.localKey, JSON.stringify(stored));
        return true;
    } catch (e: any) {
        console.error("Local storage write error", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
             alert("Storage Limit Reached: The browser's local storage is full. Please delete some items or clear browsing data to save more manuscripts.");
        }
        return false;
    }
  }

  async updateOne(filter: Filter, update: Partial<T>): Promise<boolean> {
    // 1. Try Remote MongoDB
    // MongoDB Data API expects "$set" for updates
    const remoteData = await this.request('updateOne', { 
        filter, 
        update: { $set: update } 
    });
    if (remoteData) return true;

    // 2. Local Fallback
    await this.delay();
    try {
        const json = localStorage.getItem(this.localKey);
        const stored: T[] = json ? JSON.parse(json) : [];
        
        const index = stored.findIndex((item: any) => 
            Object.entries(filter).every(([key, value]) => item[key] === value)
        );
        
        if (index !== -1) {
            stored[index] = { ...stored[index], ...update };
            localStorage.setItem(this.localKey, JSON.stringify(stored));
            return true;
        }
        return false;
    } catch (e: any) {
        console.error("Local storage update error", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
             alert("Storage Limit Reached: Unable to save changes.");
        }
        return false;
    }
  }

  async deleteOne(filter: Filter): Promise<boolean> {
    // 1. Try Remote MongoDB
    const remoteData = await this.request('deleteOne', { filter });
    if (remoteData) return true;

    // 2. Local Fallback
    await this.delay();
    try {
        const json = localStorage.getItem(this.localKey);
        const stored: T[] = json ? JSON.parse(json) : [];
        
        const initialLength = stored.length;
        // Keep items that DO NOT match the filter
        const filtered = stored.filter((item: any) => 
            !Object.entries(filter).every(([key, value]) => item[key] === value)
        );
        
        if (filtered.length !== initialLength) {
            localStorage.setItem(this.localKey, JSON.stringify(filtered));
            return true;
        }
        return false;
    } catch (e) {
        console.error("Local storage delete error", e);
        return false;
    }
  }
}

// Export Database Instance
export const db = {
  users: new MongoCollection<User>('users'),
  manuscripts: new MongoCollection<Manuscript>('manuscripts', INITIAL_MANUSCRIPTS)
};
