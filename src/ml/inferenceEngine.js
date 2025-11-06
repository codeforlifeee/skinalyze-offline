// src/ml/inferenceEngine.js
// Native TFLite Inference Engine Wrapper
// This is designed to work with tflite-react-native or react-native-fast-tflite

import { MODEL_CONFIG } from "./modelConfig";

/**
 * InferenceEngine - Native TFLite Model Wrapper
 * 
 * This class provides a unified interface for running TensorFlow Lite models
 * on mobile devices using native TFLite libraries for optimal performance.
 * 
 * Supported Libraries:
 * - tflite-react-native
 * - react-native-fast-tflite (future support)
 * 
 * Installation:
 * npm install tflite-react-native
 * 
 * Model Setup:
 * Place your .tflite model in android/app/src/main/assets/
 * and ios/[ProjectName]/assets/
 */
class InferenceEngine {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.modelPath = null;
    this.tfliteModule = null;
  }

  /**
   * Initialize the TFLite model
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('[InferenceEngine] Initializing TFLite model...');

      // Attempt to load tflite-react-native
      try {
        this.tfliteModule = require("tflite-react-native");
        console.log('[InferenceEngine] TFLite module loaded');
      } catch (error) {
        console.error('[InferenceEngine] TFLite module not found. Install: npm install tflite-react-native');
        throw new Error('TFLite module not installed. Run: npm install tflite-react-native');
      }

      // Load model from app assets
      // Note: Model should be in android/app/src/main/assets/skin_classifier.tflite
      await this._loadModel();

      console.log('[InferenceEngine] Model initialized successfully');
      return true;
    } catch (error) {
      console.error('[InferenceEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load the TFLite model
   * @private
   */
  async _loadModel() {
    return new Promise((resolve, reject) => {
      try {
        // Load model without .tflite extension
        const modelName = "skin_classifier";
        
        this.tfliteModule.loadModel(
          {
            model: modelName,
            // Optional: Specify number of threads
            numThreads: 4,
          },
          (error) => {
            if (error) {
              console.error('[InferenceEngine] Model loading error:', error);
              reject(new Error(`Failed to load model: ${error}`));
            } else {
              console.log('[InferenceEngine] Model loaded successfully');
              this.isLoaded = true;
              this.model = this.tfliteModule;
              resolve();
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Run inference on an image
   * @param {string} imagePath - File path or URI to the image
   * @returns {Promise<Object|null>} Formatted prediction results
   */
  async predict(imagePath) {
    if (!this.isLoaded) {
      console.warn('[InferenceEngine] Model not loaded yet');
      return {
        success: false,
        error: 'Model not initialized. Call initialize() first.',
      };
    }

    try {
      console.log('[InferenceEngine] Running inference on:', imagePath);
      const startTime = Date.now();

      // Run model inference using tflite-react-native
      const rawResults = await this._runInference(imagePath);

      // Format results
      const formattedResults = this._formatResults(rawResults);

      const inferenceTime = Date.now() - startTime;
      console.log(`[InferenceEngine] Inference completed in ${inferenceTime}ms`);

      return {
        success: true,
        ...formattedResults,
        inferenceTime,
        modelType: 'TFLite Native',
      };
    } catch (error) {
      console.error('[InferenceEngine] Inference error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Run inference using tflite-react-native
   * @private
   * @param {string} imagePath - Path to the image
   * @returns {Promise<Array>} Raw inference results
   */
  async _runInference(imagePath) {
    return new Promise((resolve, reject) => {
      this.model.runModelOnImage(
        {
          path: imagePath,
          imageMean: MODEL_CONFIG.input.normalization.mean,
          imageStd: MODEL_CONFIG.input.normalization.std,
          numResults: MODEL_CONFIG.output.numClasses,
          threshold: MODEL_CONFIG.output.confidenceThreshold,
        },
        (error, results) => {
          if (error) {
            reject(new Error(`Inference failed: ${error}`));
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  /**
   * Format raw model output to standard format
   * @private
   * @param {Array} rawResults - Raw results from TFLite: [{index, label, confidence}, ...]
   * @returns {Object} Formatted results
   */
  _formatResults(rawResults) {
    try {
      if (!rawResults || !Array.isArray(rawResults)) {
        throw new Error('Invalid results format');
      }

      // Map and format each prediction
      const allPredictions = rawResults
        .map((result) => {
          const classInfo = MODEL_CONFIG.classLabels[result.index];
          
          if (!classInfo) {
            console.warn(`Unknown class index: ${result.index}`);
            return null;
          }

          return {
            classIndex: result.index,
            className: classInfo.name,
            confidence: result.confidence,
            percentage: (result.confidence * 100).toFixed(2),
            riskLevel: classInfo.risk,
            color: classInfo.color,
            description: classInfo.description,
            recommendation: classInfo.recommendation,
          };
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => b.confidence - a.confidence); // Sort by confidence descending

      // Get top prediction
      const topPrediction = allPredictions[0];

      // Get top K predictions
      const topKPredictions = allPredictions.slice(0, MODEL_CONFIG.output.topKResults);

      return {
        topPrediction,
        topKPredictions,
        allPredictions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[InferenceEngine] Error formatting results:', error);
      return {
        topPrediction: null,
        topKPredictions: [],
        allPredictions: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate image before inference
   * @param {string} imagePath - Path to the image
   * @returns {Promise<Object>} Validation result
   */
  async validateImage(imagePath) {
    try {
      // Check if file exists (basic validation)
      if (!imagePath || typeof imagePath !== 'string') {
        return { valid: false, error: 'Invalid image path' };
      }

      // Additional validation can be added here
      // - File size check
      // - Format check
      // - Resolution check

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get model information
   * @returns {Object} Model configuration and status
   */
  getModelInfo() {
    return {
      isLoaded: this.isLoaded,
      modelType: 'TensorFlow Lite Native',
      ...MODEL_CONFIG.modelInfo,
      inputShape: `${MODEL_CONFIG.input.width}x${MODEL_CONFIG.input.height}x${MODEL_CONFIG.input.channels}`,
      numClasses: MODEL_CONFIG.output.numClasses,
      confidenceThreshold: MODEL_CONFIG.output.confidenceThreshold,
      classLabels: MODEL_CONFIG.classLabels.map((c) => c.name),
    };
  }

  /**
   * Close model and cleanup resources
   */
  cleanup() {
    try {
      if (this.model && typeof this.model.close === 'function') {
        this.model.close();
        console.log('[InferenceEngine] Model closed');
      }
      this.isLoaded = false;
      this.model = null;
    } catch (error) {
      console.error('[InferenceEngine] Error during cleanup:', error);
    }
  }

  /**
   * Check if model is ready for inference
   * @returns {boolean}
   */
  isReady() {
    return this.isLoaded && this.model !== null;
  }
}

// Create and export singleton instance
export const inferenceEngine = new InferenceEngine();

// Also export the class for testing/custom instances
export default InferenceEngine;
