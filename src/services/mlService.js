// mlService.js - Machine Learning Inference Service
// Handles TensorFlow Lite model loading and inference for skin lesion classification

import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { MODEL_CONFIG, getClassInfo, isConfidenceAcceptable } from '../ml/modelConfig';

class MLService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.isTFReady = false;
  }

  /**
   * Initialize TensorFlow.js and load the model
   * Call this once when the app starts
   */
  async initialize() {
    try {
      console.log('[MLService] Initializing TensorFlow.js...');
      
      // Wait for TensorFlow.js to be ready
      await tf.ready();
      this.isTFReady = true;
      console.log('[MLService] TensorFlow.js ready');

      // Load the model
      await this.loadModel();
      
      return { success: true, message: 'ML Service initialized successfully' };
    } catch (error) {
      console.error('[MLService] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load the TFLite model
   */
  async loadModel() {
    try {
      if (this.isModelLoaded) {
        console.log('[MLService] Model already loaded');
        return;
      }

      console.log('[MLService] Loading model...');
      
      // For TFLite model, we need to use bundleResourceIO
      // The model should be in assets/models/skin_classifier.tflite
      const modelJson = require('../../assets/models/model.json');
      const modelWeights = require('../../assets/models/weights.bin');
      
      // Alternative: Load from file system
      // this.model = await tf.loadLayersModel(
      //   bundleResourceIO(modelJson, modelWeights)
      // );

      // For now, we'll load a simple model architecture
      // In production, replace this with your actual TFLite model loading
      this.model = await this.createPlaceholderModel();
      
      this.isModelLoaded = true;
      console.log('[MLService] Model loaded successfully');
      
      // Warm up the model with a dummy prediction
      await this.warmUp();
      
    } catch (error) {
      console.error('[MLService] Model loading failed:', error);
      throw new Error(`Failed to load ML model: ${error.message}`);
    }
  }

  /**
   * Create a placeholder model for testing
   * Replace this with actual TFLite model loading in production
   */
  async createPlaceholderModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 7, activation: 'softmax' }),
      ],
    });

    return model;
  }

  /**
   * Warm up the model with a dummy inference
   */
  async warmUp() {
    try {
      const dummyInput = tf.zeros([1, 224, 224, 3]);
      const prediction = await this.model.predict(dummyInput);
      prediction.dispose();
      dummyInput.dispose();
      console.log('[MLService] Model warmed up');
    } catch (error) {
      console.warn('[MLService] Warm up failed:', error);
    }
  }

  /**
   * Preprocess image for model input
   * @param {string} imageUri - URI of the image file
   * @returns {tf.Tensor3D} Preprocessed image tensor
   */
  async preprocessImage(imageUri) {
    try {
      console.log('[MLService] Preprocessing image:', imageUri);

      // Read image as base64
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to array buffer
      const imageBuffer = tf.util.encodeString(imageData, 'base64').buffer;
      
      // Decode JPEG/PNG to tensor
      const imageTensor = decodeJpeg(new Uint8Array(imageBuffer));

      // Resize to model input size
      const resized = tf.image.resizeBilinear(
        imageTensor,
        [MODEL_CONFIG.input.height, MODEL_CONFIG.input.width]
      );

      // Normalize based on model config
      const normalized = tf.div(
        tf.sub(resized, MODEL_CONFIG.input.normalization.mean),
        MODEL_CONFIG.input.normalization.std
      );

      // Clean up intermediate tensors
      imageTensor.dispose();
      resized.dispose();

      return normalized;
    } catch (error) {
      console.error('[MLService] Image preprocessing failed:', error);
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Run inference on an image
   * @param {string} imageUri - URI of the image to classify
   * @returns {Object} Classification results
   */
  async classify(imageUri) {
    try {
      if (!this.isModelLoaded) {
        throw new Error('Model not loaded. Call initialize() first.');
      }

      console.log('[MLService] Starting classification...');
      const startTime = Date.now();

      // Preprocess image
      const inputTensor = await this.preprocessImage(imageUri);
      
      // Add batch dimension
      const batchedInput = inputTensor.expandDims(0);

      // Run inference
      const predictions = await this.model.predict(batchedInput);
      const predictionArray = await predictions.data();

      // Clean up tensors
      inputTensor.dispose();
      batchedInput.dispose();
      predictions.dispose();

      // Process results
      const results = this.processResults(predictionArray);
      
      const inferenceTime = Date.now() - startTime;
      console.log(`[MLService] Classification completed in ${inferenceTime}ms`);

      return {
        success: true,
        results: results.topPredictions,
        topPrediction: results.topPrediction,
        allPredictions: results.allPredictions,
        inferenceTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[MLService] Classification failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Process raw model predictions
   * @param {Float32Array} predictions - Raw prediction scores
   * @returns {Object} Formatted results
   */
  processResults(predictions) {
    // Convert to array and map with class info
    const allPredictions = Array.from(predictions).map((confidence, index) => ({
      ...getClassInfo(index),
      confidence: confidence,
      percentage: (confidence * 100).toFixed(2),
      isAcceptable: isConfidenceAcceptable(confidence),
    }));

    // Sort by confidence (descending)
    const sortedPredictions = [...allPredictions].sort(
      (a, b) => b.confidence - a.confidence
    );

    // Get top K predictions
    const topPredictions = sortedPredictions.slice(
      0,
      MODEL_CONFIG.output.topKResults
    );

    // Get the top prediction
    const topPrediction = sortedPredictions[0];

    return {
      topPrediction,
      topPredictions,
      allPredictions: sortedPredictions,
    };
  }

  /**
   * Validate image before classification
   * @param {string} imageUri - URI of the image
   * @returns {Object} Validation result
   */
  async validateImage(imageUri) {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(imageUri);

      if (!fileInfo.exists) {
        return { valid: false, error: 'Image file does not exist' };
      }

      // Check file size
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      if (fileSizeMB > MODEL_CONFIG.preprocessing.quality_checks.max_file_size_mb) {
        return {
          valid: false,
          error: `Image too large: ${fileSizeMB.toFixed(2)}MB (max: ${
            MODEL_CONFIG.preprocessing.quality_checks.max_file_size_mb
          }MB)`,
        };
      }

      // Check file format
      const extension = imageUri.split('.').pop().toLowerCase();
      if (!MODEL_CONFIG.preprocessing.quality_checks.allowed_formats.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported format: .${extension}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      isLoaded: this.isModelLoaded,
      isTFReady: this.isTFReady,
      config: MODEL_CONFIG.modelInfo,
      inputShape: `${MODEL_CONFIG.input.width}x${MODEL_CONFIG.input.height}x${MODEL_CONFIG.input.channels}`,
      numClasses: MODEL_CONFIG.output.numClasses,
      confidenceThreshold: MODEL_CONFIG.output.confidenceThreshold,
    };
  }

  /**
   * Dispose of model and free memory
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
      console.log('[MLService] Model disposed');
    }
  }
}

// Export singleton instance
export default new MLService();
