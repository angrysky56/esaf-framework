/**
 * Data Analysis Agent (DA) - First concrete ESAF agent implementation
 * @fileoverview Implements data preprocessing, feature extraction, validation, and anomaly detection
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseESAFAgent } from './base-agent.js';
import {
  Task,
  AnalysisResult,
  DataSource,
  EventType,
  DataSourceSchema
} from '../core/types.js';

/**
 * Data validation result structure
 */
interface DataValidationResult {
  isValid: boolean;
  confidence: number;
  anomalies: string[];
  sourceReliability: number;
  lastUpdated: number;
}

/**
 * Feature extraction result structure
 */
interface FeatureExtractionResult {
  features: Record<string, unknown>;
  featureCount: number;
  extractionMethod: string;
  quality: number;
}

/**
 * Data Analysis Agent implementing Bayesian probabilistic modeling
 * Handles data preprocessing, validation, feature extraction, and anomaly detection
 */
export class DataAnalysisAgent extends BaseESAFAgent {
  private readonly confidenceThreshold = 0.6;
  private readonly volatilityThreshold = 0.8;
  private dataSourceCache = new Map<string, DataSource>();

  constructor() {
    super(
      'da-agent',
      'Data Analysis Agent',
      'DataAnalysis',
      'Bayesian',
      ['BayesianNetworks', 'AnomalyDetection', 'DataNormalization', 'DataVersioning']
    );
  }

  /**
   * Execute DA-specific task processing with Bayesian analysis
   */
  protected async executeTask(task: Task): Promise<AnalysisResult> {
    const { type } = task;

    switch (type) {
      case 'data_validation':
        return await this.validateData(task);
      case 'feature_extraction':
        return await this.extractFeatures(task);
      case 'anomaly_detection':
        return await this.detectAnomalies(task);
      case 'data_backup':
        return await this.backupData(task);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Validate data sources using Bayesian confidence scoring
   */
  private async validateData(task: Task): Promise<AnalysisResult> {
    const { dataSources } = task.payload as { dataSources: unknown[] };

    if (!Array.isArray(dataSources)) {
      throw new Error('Invalid data sources payload');
    }

    const validationResults: DataValidationResult[] = [];
    let overallConfidence = 0;

    for (const sourceData of dataSources) {
      const validation = DataSourceSchema.safeParse(sourceData);

      if (!validation.success) {
        await this.publishEvent(
          EventType.CONSTRAINT_VIOLATION,
          {
            message: 'Invalid data source structure',
            errors: validation.error.errors,
            sourceData
          },
          task.id
        );
        continue;
      }

      const source = validation.data;
      this.dataSourceCache.set(source.id, source);

      // Bayesian confidence calculation
      const timeWeight = this.calculateTimeWeight(source.lastUpdated);
      const reliabilityWeight = source.reliability;
      const statusWeight = source.status === 'verified' ? 1.0 : 0.2;

      const confidence = (timeWeight * 0.3 + reliabilityWeight * 0.5 + statusWeight * 0.2);

      const result: DataValidationResult = {
        isValid: confidence >= this.confidenceThreshold,
        confidence,
        anomalies: this.detectDataAnomalies(source),
        sourceReliability: source.reliability,
        lastUpdated: source.lastUpdated
      };

      validationResults.push(result);
      overallConfidence += confidence;

      // Check for high volatility
      const volatility = this.calculateDataVolatility(source);
      if (volatility > this.volatilityThreshold) {
        await this.publishEvent(
          EventType.ANOMALY_DETECTED,
          {
            type: 'high_volatility',
            sourceId: source.id,
            volatility,
            message: 'Data source shows high volatility, requesting continuous monitoring'
          },
          task.id
        );
      }
    }

    const finalConfidence = validationResults.length > 0 ?
      overallConfidence / validationResults.length : 0;

    return {
      id: uuidv4(),
      sourceTaskId: task.id,
      agentId: this.id,
      result: {
        validationResults,
        overallConfidence: finalConfidence,
        validSourceCount: validationResults.filter(r => r.isValid).length,
        totalSourceCount: validationResults.length
      },
      confidence: finalConfidence,
      timestamp: Date.now(),
      metadata: {
        algorithm: 'BayesianNetworks',
        thresholds: {
          confidence: this.confidenceThreshold,
          volatility: this.volatilityThreshold
        }
      }
    };
  }

  /**
   * Extract features from validated data using Bayesian networks
   */
  private async extractFeatures(task: Task): Promise<AnalysisResult> {
    const { data, extractionMethod = 'bayesian' } = task.payload as {
      data: unknown;
      extractionMethod?: string;
    };

    const features: Record<string, unknown> = {};
    let quality = 0;

    if (typeof data === 'object' && data !== null) {
      // Extract statistical features
      const dataObj = data as Record<string, unknown>;

      features.keyCount = Object.keys(dataObj).length;
      features.hasNestedObjects = Object.values(dataObj).some(v => typeof v === 'object');
      features.dataTypes = this.analyzeDataTypes(dataObj);
      features.nullValues = Object.values(dataObj).filter(v => v == null).length;

      // Bayesian feature quality assessment
      quality = this.calculateFeatureQuality(features);
    }

    const result: FeatureExtractionResult = {
      features,
      featureCount: Object.keys(features).length,
      extractionMethod,
      quality
    };

    return {
      id: uuidv4(),
      sourceTaskId: task.id,
      agentId: this.id,
      result: { ...result },
      confidence: quality,
      timestamp: Date.now(),
      metadata: {
        algorithm: 'FeatureExtraction',
        method: extractionMethod
      }
    };
  }

  /**
   * Detect anomalies in data using statistical analysis
   */
  private async detectAnomalies(task: Task): Promise<AnalysisResult> {
    const { data } = task.payload as { data: unknown };
    const anomalies: string[] = [];
    let confidence = 0.8; // Base confidence for anomaly detection

    // Implement anomaly detection logic
    if (Array.isArray(data)) {
      // Check for outliers in array data
      if (data.every(item => typeof item === 'number')) {
        const numericData = data as number[];
        const outliers = this.detectOutliers(numericData);
        if (outliers.length > 0) {
          anomalies.push(`Detected ${outliers.length} statistical outliers`);
        }
      }
    }

    if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;

      // Check for structural anomalies
      if (Object.keys(dataObj).length === 0) {
        anomalies.push('Empty data object detected');
      }

      // Check for type inconsistencies
      const typeInconsistencies = this.detectTypeInconsistencies(dataObj);
      anomalies.push(...typeInconsistencies);
    }

    // Publish anomaly events if detected
    if (anomalies.length > 0) {
      await this.publishEvent(
        EventType.ANOMALY_DETECTED,
        {
          anomalyCount: anomalies.length,
          anomalies,
          severity: anomalies.length > 3 ? 'high' : 'medium'
        },
        task.id
      );
    }

    return {
      id: uuidv4(),
      sourceTaskId: task.id,
      agentId: this.id,
      result: {
        anomaliesDetected: anomalies.length,
        anomalies,
        dataHealth: anomalies.length === 0 ? 'healthy' : 'anomalous'
      },
      confidence,
      timestamp: Date.now(),
      metadata: {
        algorithm: 'AnomalyDetection',
        detectionMethods: ['statistical_outliers', 'structural_analysis', 'type_consistency']
      }
    };
  }

  /**
   * Backup data with versioning
   */
  private async backupData(task: Task): Promise<AnalysisResult> {
    const { data, version } = task.payload as { data: unknown; version?: string };

    const backupId = uuidv4();
    const timestamp = Date.now();
    const backupVersion = version || `v${timestamp}`;

    // In a real implementation, this would persist to storage
    const backupResult = {
      backupId,
      version: backupVersion,
      timestamp,
      dataSize: JSON.stringify(data).length,
      status: 'completed'
    };

    return {
      id: uuidv4(),
      sourceTaskId: task.id,
      agentId: this.id,
      result: backupResult,
      confidence: 1.0,
      timestamp,
      metadata: {
        algorithm: 'DataVersioning',
        backupMethod: 'json_serialization'
      }
    };
  }

  /**
   * Calculate time-based weight for data freshness
   */
  private calculateTimeWeight(lastUpdated: number): number {
    const now = Date.now();
    const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);

    // Data within 24 hours gets weight 0.8, older data gets lower weight
    return hoursSinceUpdate <= 24 ? 0.8 : 0.2;
  }

  /**
   * Detect anomalies in data source configuration
   */
  private detectDataAnomalies(source: DataSource): string[] {
    const anomalies: string[] = [];

    if (source.reliability < 0.3) {
      anomalies.push('Low reliability score');
    }

    if (source.status === 'error') {
      anomalies.push('Data source in error state');
    }

    const hoursSinceUpdate = (Date.now() - source.lastUpdated) / (1000 * 60 * 60);
    if (hoursSinceUpdate > 168) { // 1 week
      anomalies.push('Stale data (over 1 week old)');
    }

    return anomalies;
  }

  /**
   * Calculate data volatility score
   */
  private calculateDataVolatility(source: DataSource): number {
    // Simplified volatility calculation based on source properties
    let volatility = 0;

    if (source.type === 'stream') volatility += 0.4;
    if (source.reliability < 0.5) volatility += 0.3;
    if (source.status === 'unverified') volatility += 0.2;

    return Math.min(volatility, 1.0);
  }

  /**
   * Analyze data types in an object
   */
  private analyzeDataTypes(data: Record<string, unknown>): Record<string, number> {
    const typeCounts: Record<string, number> = {};

    Object.values(data).forEach(value => {
      const type = value === null ? 'null' : typeof value;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return typeCounts;
  }

  /**
   * Calculate feature quality score
   */
  private calculateFeatureQuality(features: Record<string, unknown>): number {
    const featureCount = Object.keys(features).length;
    let quality = Math.min(featureCount / 10, 1.0); // Normalize by expected feature count

    // Boost quality if we have diverse feature types
    if (features.dataTypes && typeof features.dataTypes === 'object') {
      const typeCount = Object.keys(features.dataTypes as object).length;
      quality = Math.min(quality + (typeCount * 0.1), 1.0);
    }

    return quality;
  }

  /**
   * Detect statistical outliers in numeric data
   */
  private detectOutliers(data: number[]): number[] {
    if (data.length < 3) return [];

    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    if (q1 === undefined || q3 === undefined) {
      return [];
    }
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(value => value < lowerBound || value > upperBound);
  }

  /**
   * Detect type inconsistencies in object data
   */
  private detectTypeInconsistencies(data: Record<string, unknown>): string[] {
    const inconsistencies: string[] = [];
    const values = Object.values(data);

    // Check if array values have consistent types
    if (values.some(Array.isArray)) {
      const arrayValues = values.filter(Array.isArray) as unknown[][];
      arrayValues.forEach((arr, index) => {
        if (arr.length > 0) {
          const firstType = typeof arr[0];
          const hasInconsistentTypes = arr.some(item => typeof item !== firstType);
          if (hasInconsistentTypes) {
            inconsistencies.push(`Array ${index} has inconsistent value types`);
          }
        }
      });
    }

    return inconsistencies;
  }
}
