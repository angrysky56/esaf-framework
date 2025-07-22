/**
 * Real Mathematical Algorithms for ESAF Framework
 * @fileoverview Actual implementations of Bayesian, statistical, and optimization algorithms
 * NO MORE FAKE LLM PROMPTING - REAL MATH ONLY
 */

import { Matrix } from 'ml-matrix';
import * as stats from 'simple-statistics';

/**
 * Real Bayesian Inference Implementation
 * Performs actual Bayesian probability calculations, not LLM prompting
 */
export class BayesianInference {
  /**
   * Calculate posterior probability using Bayes' theorem
   * P(H|E) = P(E|H) * P(H) / P(E)
   */
  static calculatePosterior(
    likelihood: number,     // P(E|H) - probability of evidence given hypothesis
    prior: number,          // P(H) - prior probability of hypothesis
    marginalLikelihood: number  // P(E) - total probability of evidence
  ): number {
    if (marginalLikelihood === 0) {
      throw new Error('Marginal likelihood cannot be zero');
    }
    return (likelihood * prior) / marginalLikelihood;
  }

  /**
   * Bayesian classification with multiple hypotheses
   * Returns the most probable hypothesis given evidence
   */
  static classify(
    evidenceVector: number[],
    hypotheses: Array<{
      name: string;
      prior: number;
      likelihoodFunction: (evidence: number[]) => number;
    }>
  ): { hypothesis: string; probability: number; confidence: number } {

    // Calculate likelihood for each hypothesis
    const likelihoods = hypotheses.map(h => ({
      name: h.name,
      prior: h.prior,
      likelihood: h.likelihoodFunction(evidenceVector)
    }));

    // Calculate marginal likelihood (normalization factor)
    const marginalLikelihood = likelihoods.reduce(
      (sum, h) => sum + (h.likelihood * h.prior),
      0
    );

    // Calculate posteriors
    const posteriors = likelihoods.map(h => ({
      hypothesis: h.name,
      probability: this.calculatePosterior(h.likelihood, h.prior, marginalLikelihood)
    }));

    // Find most probable hypothesis
    const bestHypothesis = posteriors.reduce((max, current) =>
      current.probability > max.probability ? current : max
    );

    // Calculate confidence as ratio of best to second-best
    const sortedPosteriors = posteriors.sort((a, b) => b.probability - a.probability);
    const confidence =
      sortedPosteriors[0] !== undefined &&
      sortedPosteriors[1] !== undefined &&
      sortedPosteriors[1].probability !== 0
        ? sortedPosteriors[0].probability / sortedPosteriors[1].probability
        : 1.0;

    return {
      hypothesis: bestHypothesis.hypothesis,
      probability: bestHypothesis.probability,
      confidence: Math.min(confidence, 1.0)
    };
  }

  /**
   * Bayesian update of belief distribution
   * Updates prior distribution with new evidence
   */
  static updateBelief(
    priorDistribution: Map<string, number>,
    evidence: any,
    likelihoodFunction: (hypothesis: string, evidence: any) => number
  ): Map<string, number> {

    const posterior = new Map<string, number>();
    let totalPosterior = 0;

    // Calculate unnormalized posteriors
    for (const [hypothesis, prior] of priorDistribution) {
      const likelihood = likelihoodFunction(hypothesis, evidence);
      const unnormalizedPosterior = likelihood * prior;
      posterior.set(hypothesis, unnormalizedPosterior);
      totalPosterior += unnormalizedPosterior;
    }

    // Normalize to get proper probability distribution
    if (totalPosterior > 0) {
      for (const [hypothesis, value] of posterior) {
        posterior.set(hypothesis, value / totalPosterior);
      }
    }

    return posterior;
  }
}

/**
 * Real Anomaly Detection using Statistical Methods
 * Uses actual statistical calculations, not LLM descriptions
 */
export class StatisticalAnomalyDetection {
  /**
   * Z-score based anomaly detection
   */
  static detectZScoreAnomalies(
    data: number[],
    threshold: number = 2.5
  ): { anomalies: number[]; scores: number[]; statistics: any } {

    const mean = stats.mean(data);
    const stdDev = stats.standardDeviation(data);

    // Avoid division by zero or undefined stdDev
    const safeStdDev = stdDev === 0 || stdDev === undefined ? Number.EPSILON : stdDev;

    const zScores = data.map(value => Math.abs(value - mean) / safeStdDev);
    const anomalies = data.filter((_, index) => zScores[index] !== undefined && zScores[index] > threshold);

    return {
      anomalies,
      scores: zScores,
      statistics: {
        mean,
        standardDeviation: stdDev,
        threshold,
        anomalyCount: anomalies.length,
        anomalyRate: anomalies.length / data.length
      }
    };
  }

  /**
   * Interquartile Range (IQR) based anomaly detection
   */
  static detectIQRAnomalies(data: number[]): {
    anomalies: number[];
    lowerBound: number;
    upperBound: number;
    statistics: any;
  } {

    const q1 = stats.quantile(data, 0.25);
    const q3 = stats.quantile(data, 0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const anomalies = data.filter(value => value < lowerBound || value > upperBound);

    return {
      anomalies,
      lowerBound,
      upperBound,
      statistics: {
        q1,
        q3,
        iqr,
        median: stats.median(data),
        anomalyCount: anomalies.length,
        anomalyRate: anomalies.length / data.length
      }
    };
  }

  /**
   * Modified Z-score using Median Absolute Deviation (MAD)
   * More robust to outliers than standard Z-score
   */
  static detectMADAnomalies(
    data: number[],
    threshold: number = 3.5
  ): { anomalies: number[]; scores: number[]; statistics: any } {

    const median = stats.median(data);
    const deviations = data.map(value => Math.abs(value - median));
    const mad = stats.median(deviations);

    // Calculate modified Z-scores
    const modifiedZScores = data.map(value =>
      0.6745 * (value - median) / mad
    );

    const anomalies = data.filter((_, index) =>
      modifiedZScores[index] !== undefined && Math.abs(modifiedZScores[index] as number) > threshold
    );

    return {
      anomalies,
      scores: modifiedZScores,
      statistics: {
        median,
        mad,
        threshold,
        anomalyCount: anomalies.length,
        anomalyRate: anomalies.length / data.length
      }
    };
  }
}

/**
 * Real Feature Extraction using Mathematical Methods
 * Actual statistical feature calculation, not LLM generation
 */
export class StatisticalFeatureExtraction {
  /**
   * Extract comprehensive statistical features from numerical data
   */
  static extractNumericalFeatures(data: number[]): {
    descriptive: any;
    distribution: any;
    variability: any;
    shape: any;
  } {

    if (data.length === 0) {
      throw new Error('Cannot extract features from empty dataset');
    }

    // Descriptive statistics
    const descriptive = {
      count: data.length,
      mean: stats.mean(data),
      median: stats.median(data),
      mode: stats.mode(data),
      min: stats.min(data),
      max: stats.max(data),
      range: stats.max(data) - stats.min(data)
    };

    // Distribution characteristics
    const distribution = {
      q1: stats.quantile(data, 0.25),
      q3: stats.quantile(data, 0.75),
      iqr: stats.quantile(data, 0.75) - stats.quantile(data, 0.25),
      percentile_90: stats.quantile(data, 0.90),
      percentile_95: stats.quantile(data, 0.95),
      percentile_99: stats.quantile(data, 0.99)
    };

    // Variability measures
    const variability = {
      variance: stats.variance(data),
      standardDeviation: stats.standardDeviation(data),
      coefficientOfVariation: stats.standardDeviation(data) / Math.abs(stats.mean(data)),
      meanAbsoluteDeviation: this.calculateMeanAbsoluteDeviation(data)
    };

    // Shape characteristics
    const shape = {
      skewness: this.calculateSkewness(data),
      kurtosis: this.calculateKurtosis(data)
    };

    return { descriptive, distribution, variability, shape };
  }

  /**
   * Calculate mean absolute deviation
   */
  private static calculateMeanAbsoluteDeviation(data: number[]): number {
    const mean = stats.mean(data);
    const deviations = data.map(value => Math.abs(value - mean));
    return stats.mean(deviations);
  }

  /**
   * Calculate skewness (measure of asymmetry)
   */
  private static calculateSkewness(data: number[]): number {
    const mean = stats.mean(data);
    const stdDev = stats.standardDeviation(data);
    const n = data.length;

    const sumCubedDeviations = data.reduce((sum, value) => {
      const deviation = (value - mean) / stdDev;
      return sum + Math.pow(deviation, 3);
    }, 0);

    return sumCubedDeviations / n;
  }

  /**
   * Calculate kurtosis (measure of tail heaviness)
   */
  private static calculateKurtosis(data: number[]): number {
    const mean = stats.mean(data);
    const stdDev = stats.standardDeviation(data);
    const n = data.length;

    const sumFourthDeviations = data.reduce((sum, value) => {
      const deviation = (value - mean) / stdDev;
      return sum + Math.pow(deviation, 4);
    }, 0);

    return (sumFourthDeviations / n) - 3; // Excess kurtosis (normal distribution = 0)
  }

  /**
   * Extract correlation matrix for multivariate data
   */
  static extractCorrelationFeatures(dataMatrix: number[][]): {
    correlationMatrix: Matrix;
    strongCorrelations: Array<{ var1: number; var2: number; correlation: number }>;
    averageCorrelation: number;
  } {

    const matrix = new Matrix(dataMatrix);
    const correlationMatrix = this.calculateCorrelationMatrix(matrix);

    // Find strong correlations (|r| > 0.7)
    const strongCorrelations: Array<{ var1: number; var2: number; correlation: number }> = [];
    const correlations: number[] = [];

    for (let i = 0; i < correlationMatrix.rows; i++) {
      for (let j = i + 1; j < correlationMatrix.columns; j++) {
        const correlation = correlationMatrix.get(i, j);
        correlations.push(Math.abs(correlation));

        if (Math.abs(correlation) > 0.7) {
          strongCorrelations.push({ var1: i, var2: j, correlation });
        }
      }
    }

    const averageCorrelation = correlations.length > 0
      ? correlations.reduce((sum, r) => sum + r, 0) / correlations.length
      : 0;

    return {
      correlationMatrix,
      strongCorrelations,
      averageCorrelation
    };
  }

  /**
   * Calculate Pearson correlation matrix
   */
  private static calculateCorrelationMatrix(matrix: Matrix): Matrix {
    const correlationMatrix = new Matrix(matrix.columns, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        if (i === j) {
          correlationMatrix.set(i, j, 1.0);
        } else {
          const col1 = matrix.getColumn(i);
          const col2 = matrix.getColumn(j);
          const correlation = this.calculatePearsonCorrelation(col1, col2);
          correlationMatrix.set(i, j, correlation);
        }
      }
    }

    return correlationMatrix;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length for correlation calculation');
    }

    const n = x.length;
    const meanX = stats.mean(x);
    const meanY = stats.mean(y);

    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      if (x[i] === undefined || y[i] === undefined) {
        continue;
      }
      const xi = x[i] as number;
      const yi = y[i] as number;
      const devX = xi - meanX;
      const devY = yi - meanY;

      sumXY += devX * devY;
      sumX2 += devX * devX;
      sumY2 += devY * devY;
    }

    const denominator = Math.sqrt(sumX2 * sumY2);
    return denominator === 0 ? 0 : sumXY / denominator;
  }
}

/**
 * Real Data Validation using Mathematical Checks
 * Actual validation logic, not LLM descriptions
 */
export class MathematicalDataValidation {
  /**
   * Comprehensive data quality assessment
   */
  static validateDataQuality(data: any[]): {
    isValid: boolean;
    quality: number;
    issues: string[];
    statistics: any;
    recommendations: string[];
  } {

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for missing data
    const missingCount = data.filter(item =>
      item === null || item === undefined || item === ''
    ).length;
    const missingRate = missingCount / data.length;

    if (missingRate > 0.1) {
      issues.push(`High missing data rate: ${(missingRate * 100).toFixed(1)}%`);
      recommendations.push('Consider data imputation or collection improvement');
    }

    // Check for numerical data validity
    const numericalData = data.filter(item => typeof item === 'number' && !isNaN(item));
    let outlierRate = 0;
    if (numericalData.length > 0) {
      const outlierAnalysis = StatisticalAnomalyDetection.detectIQRAnomalies(numericalData);
      outlierRate = outlierAnalysis.anomalies.length / numericalData.length;

      if (outlierRate > 0.05) {
        issues.push(`High outlier rate: ${(outlierRate * 100).toFixed(1)}%`);
        recommendations.push('Investigate outliers for data collection errors');
      }
    }

    // Check data consistency
    const uniqueTypes = new Set(data.map(item => typeof item));
    if (uniqueTypes.size > 2) {
      issues.push('Inconsistent data types detected');
      recommendations.push('Standardize data types for consistent analysis');
    }

    // Calculate overall quality score
    let qualityScore = 1.0;
    qualityScore -= missingRate * 0.5;  // Missing data penalty
    qualityScore -= Math.min(outlierRate, 0.1) * 2;  // Outlier penalty
    qualityScore -= (uniqueTypes.size - 1) * 0.1;  // Type inconsistency penalty
    qualityScore = Math.max(0, qualityScore);

    return {
      isValid: issues.length === 0,
      quality: qualityScore,
      issues,
      statistics: {
        totalCount: data.length,
        missingCount,
        missingRate,
        uniqueTypes: Array.from(uniqueTypes),
        outlierRate: outlierRate
      },
      recommendations
    };
  }
}
