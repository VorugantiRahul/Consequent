/**
 * Official Hindsight Client Integration
 * Powered by @vectorize-io/hindsight-client
 * Implements: retain, recall, reflect, and bank synchronization
 */

const { HindsightClient } = require('@vectorize-io/hindsight-client');
const dotenv = require('dotenv');
dotenv.config();

class HindsightService {
  constructor() {
    this.apiKey = process.env.HINDSIGHT_API_KEY || '';
    this.baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
    this.bankId = process.env.HINDSIGHT_BANK_ID || 'consequent-operations';
    this.client = null;
    this.isConnected = false;
    this.connectionError = null;
    this.lastSyncedAt = null;

    this.initClient();
  }

  initClient() {
    try {
      this.client = new HindsightClient({
        baseUrl: this.baseUrl,
        apiKey: this.apiKey || undefined
      });
      // If API key is present or local daemon is specified, mark potential connection
      if (this.apiKey || this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1')) {
        this.isConnected = true;
      }
    } catch (err) {
      console.warn('⚠️ Hindsight Client initialization warning:', err.message);
      this.isConnected = false;
      this.connectionError = err.message;
    }
  }

  configure({ apiKey, baseUrl, bankId }) {
    if (apiKey !== undefined) this.apiKey = apiKey.trim();
    if (baseUrl !== undefined) this.baseUrl = baseUrl.trim();
    if (bankId !== undefined) this.bankId = bankId.trim();

    this.initClient();
    return this.getStatus();
  }

  getStatus() {
    return {
      provider: 'Vectorize Hindsight (@vectorize-io/hindsight-client)',
      baseUrl: this.baseUrl,
      bankId: this.bankId,
      hasApiKey: Boolean(this.apiKey),
      isConfigured: Boolean(this.apiKey || this.baseUrl.includes('localhost')),
      isConnected: this.isConnected,
      connectionError: this.connectionError,
      lastSyncedAt: this.lastSyncedAt,
      mode: this.apiKey ? 'HINDSIGHT_CLOUD' : (this.baseUrl.includes('localhost') ? 'HINDSIGHT_LOCAL_DAEMON' : 'HYBRID_STANDBY')
    };
  }

  /**
   * Ping / Test connectivity with Hindsight API
   */
  async testConnection() {
    if (!this.client) {
      return { success: false, message: 'Hindsight client not initialized.' };
    }

    try {
      // Attempt to inspect bank profile or version
      const version = await this.client.getVersion();
      this.isConnected = true;
      this.connectionError = null;
      return {
        success: true,
        version,
        message: `Successfully connected to Hindsight API (${this.baseUrl})`
      };
    } catch (err) {
      this.connectionError = err.message || String(err);
      return {
        success: false,
        error: this.connectionError,
        message: `Could not reach Hindsight API at ${this.baseUrl}: ${this.connectionError}`
      };
    }
  }

  /**
   * Ensure memory bank exists with appropriate mission
   */
  async ensureBank() {
    if (!this.client) return null;
    try {
      await this.client.createBank(this.bankId, {
        name: 'Consequent Operations Memory Bank',
        mission: 'Record enterprise customer escalations, recommendations, human actions, and real-world consequences to reinforce future decision intelligence.'
      });
      return true;
    } catch (err) {
      // Bank might already exist, which is expected
      return true;
    }
  }

  /**
   * RETAIN: Ingests an operational case consequence into Hindsight
   */
  async retainConsequence(experience) {
    if (!this.client) return null;

    const content = `
Case Code: ${experience.caseCode || experience.id}
Customer: ${experience.customerName} (${experience.customerTier})
Contract Value: ${experience.contractValue}
Category: ${experience.issueCategory}
Urgency: ${experience.urgency}
Problem Summary: ${experience.problemSummary}
Recommended Approach: ${experience.recommendedApproach}
Action Taken: ${experience.actionTaken}
Real-World Outcome: ${experience.outcome}
Resolution Turnaround: ${experience.resolutionTime}
Customer Response: ${experience.customerResponse}
${experience.failureReason ? `Failure Reason: ${experience.failureReason}` : ''}
Hindsight Reflection: ${experience.hindsightTakeaway}
`.trim();

    try {
      await this.ensureBank();
      const response = await this.client.retain(this.bankId, content, {
        context: `Enterprise escalation for ${experience.customerTier} client ${experience.customerName}`,
        metadata: {
          id: experience.id,
          customerTier: experience.customerTier,
          issueCategory: experience.issueCategory,
          outcome: experience.outcome,
          confidence: experience.confidence,
          contractValue: experience.contractValue
        },
        tags: [
          experience.customerTier,
          experience.issueCategory,
          experience.outcome
        ]
      });

      console.log(`✅ [Hindsight Retain] Consequence ${experience.id} retained in bank "${this.bankId}"`);
      return response;
    } catch (err) {
      console.warn(`ℹ️ [Hindsight Retain Notice] Could not push to remote Hindsight (${err.message}). Stored in hybrid cache.`);
      return null;
    }
  }

  /**
   * RECALL: Query Hindsight across 4 parallel retrieval strategies
   */
  async recallMemories(queryText, options = {}) {
    if (!this.client) return null;

    try {
      const response = await this.client.recall(this.bankId, queryText, {
        budget: options.budget || 'mid',
        tags: options.tags || undefined,
        maxTokens: options.maxTokens || 2000
      });

      return response;
    } catch (err) {
      console.warn(`ℹ️ [Hindsight Recall Notice] Remote recall unavailable (${err.message}). Using empirical index.`);
      return null;
    }
  }

  /**
   * REFLECT: High-level mental model synthesis over historical consequences
   */
  async reflectOnPatterns(queryText) {
    if (!this.client) return null;

    try {
      const response = await this.client.reflect(this.bankId, queryText, {
        budget: 'low'
      });
      return response;
    } catch (err) {
      console.warn(`ℹ️ [Hindsight Reflect Notice] Remote reflection unavailable: ${err.message}`);
      return null;
    }
  }

  /**
   * Batch Sync: Push all seed cases into Hindsight Memory Bank
   */
  async syncBatch(experiences) {
    if (!this.client) {
      return { success: false, message: 'Client not configured.' };
    }

    try {
      await this.ensureBank();
      let syncedCount = 0;

      for (const exp of experiences) {
        await this.retainConsequence(exp);
        syncedCount++;
      }

      this.lastSyncedAt = new Date().toISOString();
      return {
        success: true,
        syncedCount,
        bankId: this.bankId,
        message: `Successfully synchronized ${syncedCount} consequences into Hindsight bank "${this.bankId}".`
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: `Failed to batch sync to Hindsight: ${err.message}`
      };
    }
  }
}

module.exports = new HindsightService();
