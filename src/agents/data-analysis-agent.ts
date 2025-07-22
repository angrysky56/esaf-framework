/**
 * Data Analysis Agent (DA) - Mathematical Implementation
 * @fileoverview Uses actual mathematical algorithms for data analysis
 */

import { BaseESAFAgent } from '@/agents/base-agent';
import { 
  BayesianInference,
  StatisticalAnomalyDetection,
  StatisticalFeatureExtraction,
  MathematicalDataValidation
} from '@/core/real-algorithms';
import { LLMProvider, LLMRequest, llmService } from '@/core/llm-service';
import { Task, AnalysisResult } from '@/core/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Data Analysis Agent that performs actual mathematical computations
 * Uses LLM only for natural language interpretation, not algorithm simulation
 */
export class DataAnalysisAgent extends BaseESAFAgent {
  protected preferredProvider: LLMProvider;
  protected systemPrompt: string;

  constructor(preferredProvider: LLMProvider = LLMProvider.GOOGLE_GENAI) {
    super(
      'data-analysis',
      'Data Analysis Agent',
      'DataAnalysis',
      'BayesianMathematical',
      ['MathematicalDataValidation', 'StatisticalFeatureExtraction', 'StatisticalAnomalyDetection', 'BayesianInference']
    );
    
    this.preferredProvider = preferredProvider;
    
    // Set LLM configuration for UI display
    this.llmProvider = preferredProvider;
    this.llmStatus = 'unknown';
    
    this.systemPrompt = `You are a Data Analysis Agent that interprets the results of real mathematical computations.
Your role is to:
1. Interpret the results of actual Bayesian inference calculations
2. Explain the meaning of real statistical analysis results  
3. Provide insights based on actual mathematical computations
4. Translate mathematical results into actionable recommendations

IMPORTANT: You do NOT perform calculations yourself. You interpret results from real algorithms.`;
  }

  /**
   * Execute task using REAL algorithms, not LLM prompting
   */
  protected async executeTask(task: Task): Promise<AnalysisResult> {
    console.log(`🧮 DA Agent executing task: ${task.type}`);
    console.log(`Task payload:`, task.payload);
    
    try {
      switch (task.type) {
        case 'data_validation':
          return await this.performRealDataValidation(task);
        case 'feature_extraction':
          return await this.performRealFeatureExtraction(task);
        case 'anomaly_detection':
          return await this.performRealAnomalyDetection(task);
        case 'intelligent_analysis':
          return await this.performRealIntelligentAnalysis(task);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      console.error(`❌ Data Analysis Agent failed:`, error);
      console.error(`Task details:`, task);
      throw error;
    }
  }

  /**
   * REAL data validation using mathematical checks
   */
  private async performRealDataValidation(task: Task): Promise<AnalysisResult> {
    const { data } = task.payload as { data: any[] };
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data validation requires non-empty array');
    }

    // REAL ALGORITHM: Mathematical data quality assessment
    const validationResults = MathematicalDataValidation.validateDataQuality(data);
    
    // Use LLM only to interpret the mathematical results
    const interpretationPrompt = `Interpret these REAL data validation results:

MATHEMATICAL ANALYSIS RESULTS:
- Data Quality Score: ${validationResults.quality.toFixed(3)}
- Valid: ${validationResults.isValid}
- Issues Found: ${validationResults.issues.join(', ') || 'None'}
- Missing Data Rate: ${(validationResults.statistics.missingRate * 100).toFixed(1)}%
- Total Records: ${validationResults.statistics.totalCount}

RECOMMENDATIONS FROM ALGORITHMS:
${validationResults.recommendations.join('\n')}

Provide a clear interpretation of what these mathematical results mean for data quality and next steps.`;

    const llmRequest: LLMRequest = {
      prompt: interpretationPrompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.3,
      maxTokens: 1024
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      
      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          // REAL mathematical results
          validationResults,
          dataQualityScore: validationResults.quality,
          issues: validationResults.issues,
          recommendations: validationResults.recommendations,
          
          // LLM interpretation of real results
          interpretation: llmResponse.content,
          
          metadata: {
            algorithm: 'MathematicalDataValidation',
            calculationType: 'REAL_MATH_NOT_LLM_FAKE',
            llmRole: 'interpretation_only'
          }
        },
        confidence: validationResults.quality,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'Real Mathematical Data Validation',
          provider: llmResponse.provider,
          analysisType: 'real_data_validation'
        }
      };
    } catch (error) {
      throw new Error(`Real data validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * REAL feature extraction using statistical mathematics
   */
  private async performRealFeatureExtraction(task: Task): Promise<AnalysisResult> {
    const { data, extractionMethod } = task.payload as { 
      data: number[] | number[][]; 
      extractionMethod?: string;
    };

    let mathematicalFeatures: any;
    let algorithmUsed: string;

    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === 'number') {
        // REAL ALGORITHM: Statistical feature extraction for 1D data
        mathematicalFeatures = StatisticalFeatureExtraction.extractNumericalFeatures(data as number[]);
        algorithmUsed = 'StatisticalFeatureExtraction_1D';
      } else if (Array.isArray(data[0])) {
        // REAL ALGORITHM: Correlation analysis for multivariate data
        mathematicalFeatures = StatisticalFeatureExtraction.extractCorrelationFeatures(data as number[][]);
        algorithmUsed = 'StatisticalFeatureExtraction_Multivariate';
      } else {
        throw new Error('Feature extraction requires numerical data');
      }
    } else {
      throw new Error('Feature extraction requires non-empty data array');
    }

    // Use LLM only to interpret the mathematical feature results
    const interpretationPrompt = `Interpret these REAL mathematical feature extraction results:

ALGORITHM USED: ${algorithmUsed}
DATA POINTS: ${Array.isArray(data) ? data.length : 'Unknown'}

MATHEMATICAL FEATURES:
${JSON.stringify(mathematicalFeatures, null, 2)}

Provide insights about:
1. What these mathematical features reveal about the data
2. Which features are most significant for analysis
3. Potential patterns or relationships discovered
4. Recommendations for further analysis

Focus on interpreting the numerical results, not performing calculations.`;

    const llmRequest: LLMRequest = {
      prompt: interpretationPrompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.4,
      maxTokens: 1536
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      
      // Calculate confidence based on data completeness and feature richness
      const confidence = this.calculateFeatureConfidence(mathematicalFeatures, data);

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          // REAL mathematical features
          mathematicalFeatures,
          algorithmUsed,
          extractionMethod: extractionMethod || 'statistical_analysis',
          dataProfile: {
            size: Array.isArray(data) ? data.length : 0,
            dimensions: Array.isArray(data[0]) ? data[0].length : 1,
            type: typeof data[0] === 'number' ? 'numerical_1d' : 'numerical_multivariate'
          },
          
          // LLM interpretation of real results  
          interpretation: llmResponse.content,
          
          metadata: {
            algorithm: algorithmUsed,
            calculationType: 'REAL_MATH_NOT_LLM_FAKE',
            llmRole: 'interpretation_only'
          }
        },
        confidence,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'Real Mathematical Feature Extraction',
          provider: llmResponse.provider,
          analysisType: 'real_feature_extraction'
        }
      };
    } catch (error) {
      throw new Error(`Real feature extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * REAL anomaly detection using statistical algorithms
   */
  private async performRealAnomalyDetection(task: Task): Promise<AnalysisResult> {
    const { data, method, threshold } = task.payload as { 
      data: number[]; 
      method?: 'zscore' | 'iqr' | 'mad';
      threshold?: number;
    };

    if (!Array.isArray(data) || data.some(item => typeof item !== 'number')) {
      throw new Error('Anomaly detection requires array of numbers');
    }

    let anomalyResults: any;
    let algorithmUsed: string;

    // REAL ALGORITHMS: Actual statistical anomaly detection
    switch (method || 'zscore') {
      case 'zscore':
        anomalyResults = StatisticalAnomalyDetection.detectZScoreAnomalies(data, threshold || 2.5);
        algorithmUsed = 'Z-Score Anomaly Detection';
        break;
      case 'iqr':
        anomalyResults = StatisticalAnomalyDetection.detectIQRAnomalies(data);
        algorithmUsed = 'IQR Anomaly Detection';
        break;
      case 'mad':
        anomalyResults = StatisticalAnomalyDetection.detectMADAnomalies(data, threshold || 3.5);
        algorithmUsed = 'MAD Anomaly Detection';
        break;
      default:
        throw new Error(`Unsupported anomaly detection method: ${method}`);
    }

    // Use LLM only to interpret the mathematical anomaly results
    const interpretationPrompt = `Interpret these REAL anomaly detection results:

ALGORITHM: ${algorithmUsed}
DATA POINTS ANALYZED: ${data.length}

MATHEMATICAL RESULTS:
- Anomalies Found: ${anomalyResults.anomalies.length}
- Anomaly Rate: ${(anomalyResults.statistics.anomalyRate * 100).toFixed(2)}%
- Statistical Summary: ${JSON.stringify(anomalyResults.statistics, null, 2)}

ANOMALIES DETECTED:
${anomalyResults.anomalies.slice(0, 10).join(', ')}${anomalyResults.anomalies.length > 10 ? '...' : ''}

Provide insights about:
1. Significance of the detected anomalies
2. Potential causes or patterns in the anomalies
3. Impact assessment for data quality
4. Recommendations for handling these anomalies

Interpret the mathematical results, don't recalculate them.`;

    const llmRequest: LLMRequest = {
      prompt: interpretationPrompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.3,
      maxTokens: 1024
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      
      // Calculate confidence based on statistical significance
      const confidence = this.calculateAnomalyConfidence(anomalyResults, data.length);

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          // REAL mathematical anomaly detection results
          anomalyResults,
          algorithmUsed,
          anomaliesDetected: anomalyResults.anomalies,
          anomalyRate: anomalyResults.statistics.anomalyRate,
          statisticalMeasures: anomalyResults.statistics,
          
          // LLM interpretation of real results
          interpretation: llmResponse.content,
          
          metadata: {
            algorithm: algorithmUsed,
            calculationType: 'REAL_MATH_NOT_LLM_FAKE',
            llmRole: 'interpretation_only'
          }
        },
        confidence,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'Real Statistical Anomaly Detection',
          provider: llmResponse.provider,
          analysisType: 'real_anomaly_detection'
        }
      };
    } catch (error) {
      throw new Error(`Real anomaly detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * REAL intelligent analysis combining multiple mathematical approaches
   */
  private async performRealIntelligentAnalysis(task: Task): Promise<AnalysisResult> {
    console.log(`🎯 Starting intelligent analysis...`);
    const { data, query } = task.payload as { data: any; query: string };
    console.log(`Query: "${query}"`);
    console.log(`Data type: ${typeof data}, Array: ${Array.isArray(data)}, Length: ${Array.isArray(data) ? data.length : 'N/A'}`);

    // Extract numerical data for mathematical analysis
    const numericalData = this.extractNumericalData(data);
    console.log(`Extracted numerical data: ${numericalData.length} numbers`);
    
    if (numericalData.length === 0) {
      console.warn(`⚠️ No numerical data found, creating fallback analysis`);
      // Create a simple fallback response when no numerical data is available
      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          analysis: `I analyzed your query: "${query}"\n\nHowever, no numerical data was available for mathematical analysis. This could be because:\n- The data hasn't been uploaded yet\n- The data is text-based rather than numerical\n- The data format isn't recognized\n\nFor best results, please upload numerical data (CSV files, arrays of numbers, etc.) and ask again.`,
          comprehensiveAnalysis: {
            dataValidation: { quality: 0, isValid: false, issues: ['No numerical data available'] },
            dataAvailable: false,
            dataType: typeof data,
            isArray: Array.isArray(data)
          },
          insights: [
            'No numerical data available for analysis',
            'Consider uploading CSV files or numerical datasets',
            'Text-based analysis capabilities coming soon'
          ],
          metadata: {
            algorithmsUsed: ['Fallback'],
            calculationType: 'FALLBACK_NO_DATA',
            llmRole: 'primary_response'
          }
        },
        confidence: 0.3,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'Fallback Analysis',
          analysisType: 'fallback_no_data'
        }
      };
    }

    try {
      console.log(`📊 Running mathematical algorithms...`);
      
      // REAL ALGORITHMS: Multiple mathematical analyses
      const validationResults = MathematicalDataValidation.validateDataQuality([data].flat());
      console.log(`✅ Data validation completed. Quality: ${validationResults.quality}`);
      
      const featureResults = StatisticalFeatureExtraction.extractNumericalFeatures(numericalData);
      console.log(`✅ Feature extraction completed. Mean: ${featureResults.descriptive.mean}`);
      
      const anomalyResults = StatisticalAnomalyDetection.detectZScoreAnomalies(numericalData);
      console.log(`✅ Anomaly detection completed. Found ${anomalyResults.anomalies.length} anomalies`);

      // Bayesian classification of data quality
      const qualityHypotheses = [
        { 
          name: 'high_quality', 
          prior: 0.3, 
          likelihoodFunction: () => validationResults.quality > 0.8 ? 0.9 : 0.1 
        },
        { 
          name: 'medium_quality', 
          prior: 0.5, 
          likelihoodFunction: () => validationResults.quality > 0.5 ? 0.8 : 0.2 
        },
        { 
          name: 'low_quality', 
          prior: 0.2, 
          likelihoodFunction: () => validationResults.quality < 0.5 ? 0.9 : 0.1 
        }
      ];

      const bayesianClassification = BayesianInference.classify(
        [validationResults.quality, anomalyResults.statistics.anomalyRate],
        qualityHypotheses
      );
      console.log(`✅ Bayesian classification: ${bayesianClassification.hypothesis}`);

      // Create interpretation without LLM if it fails
      let interpretation = `**Mathematical Analysis Results**

**Query**: ${query}

**Data Overview**: 
- ${numericalData.length} numerical data points analyzed
- Data quality: ${bayesianClassification.hypothesis} (${(bayesianClassification.probability * 100).toFixed(1)}% confidence)
- Quality score: ${validationResults.quality.toFixed(3)}

**Statistical Summary**:
- Mean: ${featureResults.descriptive.mean.toFixed(3)}
- Standard deviation: ${featureResults.variability.standardDeviation.toFixed(3)}
- Distribution: ${featureResults.shape.skewness > 0.5 ? 'right-skewed' : featureResults.shape.skewness < -0.5 ? 'left-skewed' : 'approximately normal'}

**Anomaly Detection**:
- ${anomalyResults.anomalies.length} anomalies detected (${(anomalyResults.statistics.anomalyRate * 100).toFixed(2)}% of data)
- Detection method: Z-score analysis

**Key Insights**:
- Data quality classified as **${bayesianClassification.hypothesis}**
- ${anomalyResults.anomalies.length > 0 ? `Found ${anomalyResults.anomalies.length} potential outliers` : 'No significant anomalies detected'}
- ${validationResults.issues.length > 0 ? `Issues identified: ${validationResults.issues.join(', ')}` : 'No data quality issues found'}`;

      // Try to use LLM for enhanced interpretation
      try {
        console.log(`🤖 Attempting LLM interpretation...`);
        const interpretationPrompt = `Interpret this comprehensive REAL mathematical analysis:

USER QUERY: "${query}"

MATHEMATICAL ANALYSIS RESULTS:
1. DATA VALIDATION:
   Quality Score: ${validationResults.quality.toFixed(3)}
   Issues: ${validationResults.issues.join(', ') || 'None'}

2. STATISTICAL FEATURES:
   Mean: ${featureResults.descriptive.mean.toFixed(3)}
   Std Dev: ${featureResults.variability.standardDeviation.toFixed(3)}
   Skewness: ${featureResults.shape.skewness.toFixed(3)}
   Kurtosis: ${featureResults.shape.kurtosis.toFixed(3)}

3. ANOMALY DETECTION:
   Anomalies Found: ${anomalyResults.anomalies.length}
   Anomaly Rate: ${(anomalyResults.statistics.anomalyRate * 100).toFixed(2)}%

4. BAYESIAN CLASSIFICATION:
   Data Quality Classification: ${bayesianClassification.hypothesis}
   Probability: ${bayesianClassification.probability.toFixed(3)}
   Confidence: ${bayesianClassification.confidence.toFixed(3)}

Provide a comprehensive analysis that addresses the user's query using these REAL mathematical results.`;

        const llmRequest: LLMRequest = {
          prompt: interpretationPrompt,
          systemPrompt: this.systemPrompt,
          provider: this.preferredProvider,
          temperature: 0.4,
          maxTokens: 2048
        };

        const llmResponse = await llmService.generateCompletion(llmRequest);
        interpretation = llmResponse.content;
        console.log(`✅ LLM interpretation successful`);
        
      } catch (llmError) {
        console.warn(`⚠️ LLM interpretation failed, using mathematical results only:`, llmError);
        // interpretation already set above as fallback
      }
      
      const finalResult = {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          // REAL mathematical analysis results
          comprehensiveAnalysis: {
            dataValidation: validationResults,
            statisticalFeatures: featureResults,
            anomalyDetection: anomalyResults,
            bayesianClassification
          },
          
          // Interpretation (LLM-enhanced or mathematical fallback)
          interpretation,
          analysis: interpretation,
          
          // Summary metrics from real calculations
          insights: [
            `Data quality: ${bayesianClassification.hypothesis} (${(bayesianClassification.probability * 100).toFixed(1)}% confidence)`,
            `${anomalyResults.anomalies.length} anomalies detected (${(anomalyResults.statistics.anomalyRate * 100).toFixed(2)}% of data)`,
            `Distribution: ${featureResults.shape.skewness > 0 ? 'right-skewed' : featureResults.shape.skewness < -0.5 ? 'left-skewed' : 'approximately normal'}`
          ],
          
          metadata: {
            algorithmsUsed: ['MathematicalDataValidation', 'StatisticalFeatureExtraction', 'StatisticalAnomalyDetection', 'BayesianInference'],
            calculationType: 'REAL_MATH_NOT_LLM_FAKE',
            llmRole: 'interpretation_only',
            numericalDataCount: numericalData.length,
            dataQualityScore: validationResults.quality
          }
        },
        confidence: bayesianClassification.confidence * 0.8 + validationResults.quality * 0.2,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'Real Comprehensive Mathematical Analysis',
          analysisType: 'real_intelligent_analysis'
        }
      };

      console.log(`✅ Intelligent analysis completed successfully`);
      return finalResult;
      
    } catch (error) {
      console.error(`❌ Mathematical algorithms failed:`, error);
      throw new Error(`Real intelligent analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract numerical data from mixed data types
   */
  private extractNumericalData(data: any): number[] {
    if (Array.isArray(data)) {
      return data.filter(item => typeof item === 'number' && !isNaN(item));
    } else if (typeof data === 'object' && data !== null) {
      const values = Object.values(data);
      return values.filter(item => typeof item === 'number' && !isNaN(item)) as number[];
    } else if (typeof data === 'number' && !isNaN(data)) {
      return [data];
    }
    return [];
  }

  /**
   * Calculate confidence for feature extraction results
   */
  private calculateFeatureConfidence(features: any, data: any): number {
    const dataSize = Array.isArray(data) ? data.length : 1;
    const sizeConfidence = Math.min(dataSize / 30, 1.0); // More data = higher confidence
    
    // Check feature completeness
    const hasDescriptive = features.descriptive && Object.keys(features.descriptive).length > 0;
    const hasVariability = features.variability && Object.keys(features.variability).length > 0;
    const featureCompleteness = (hasDescriptive ? 0.5 : 0) + (hasVariability ? 0.5 : 0);
    
    return sizeConfidence * 0.6 + featureCompleteness * 0.4;
  }

  /**
   * Calculate confidence for anomaly detection results
   */
  private calculateAnomalyConfidence(anomalyResults: any, dataSize: number): number {
    const sizeConfidence = Math.min(dataSize / 50, 1.0); // More data = higher confidence
    const anomalyRate = anomalyResults.statistics.anomalyRate;
    
    // Moderate anomaly rates are more reliable than extreme rates
    const rateConfidence = anomalyRate > 0.01 && anomalyRate < 0.2 ? 1.0 : 0.7;
    
    return sizeConfidence * 0.7 + rateConfidence * 0.3;
  }
}
