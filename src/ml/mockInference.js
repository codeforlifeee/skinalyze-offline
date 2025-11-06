// src/ml/mockInference.js
// Mock ML Inference for Testing and Development
// Use this when you don't have a real TFLite model yet

import { MODEL_CONFIG } from "./modelConfig";

/**
 * Mock inference function for testing
 * Simulates ML model predictions without requiring actual model
 * 
 * @param {string} imagePath - Path to the image (not used in mock, but kept for API consistency)
 * @returns {Promise<Object>} Mock prediction results
 */
export const mockInference = async (imagePath) => {
  console.log('[MockInference] Running mock inference for:', imagePath);
  
  try {
    // Simulate network/processing delay (500ms - 1000ms)
    const delay = 500 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate realistic mock predictions
    const mockResults = generateMockPredictions();

    console.log('[MockInference] Mock inference completed');
    
    return {
      success: true,
      ...mockResults,
      inferenceTime: Math.round(delay),
      modelType: 'Mock (Testing)',
      isMockData: true, // Flag to indicate this is not real inference
    };
  } catch (error) {
    console.error('[MockInference] Error:', error);
    return {
      success: false,
      error: error.message,
      isMockData: true,
    };
  }
};

/**
 * Generate realistic mock predictions
 * @private
 * @returns {Object} Mock prediction results
 */
function generateMockPredictions() {
  // Randomly select a primary prediction
  const primaryIndex = Math.floor(Math.random() * MODEL_CONFIG.output.numClasses);
  
  // Generate confidence scores for all classes
  const confidences = MODEL_CONFIG.classLabels.map((_, index) => {
    if (index === primaryIndex) {
      // Primary prediction: 70-95% confidence
      return 0.70 + Math.random() * 0.25;
    } else {
      // Other predictions: 1-20% confidence
      return 0.01 + Math.random() * 0.19;
    }
  });

  // Normalize confidences to sum to 1
  const sum = confidences.reduce((a, b) => a + b, 0);
  const normalizedConfidences = confidences.map((c) => c / sum);

  // Create all predictions
  const allPredictions = normalizedConfidences
    .map((confidence, index) => {
      const classInfo = MODEL_CONFIG.classLabels[index];
      return {
        classIndex: index,
        className: classInfo.name,
        confidence: confidence,
        percentage: (confidence * 100).toFixed(2),
        riskLevel: classInfo.risk,
        color: classInfo.color,
        description: classInfo.description,
        recommendation: classInfo.recommendation,
      };
    })
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
}

/**
 * Generate mock prediction for a specific condition (for testing specific scenarios)
 * @param {string} conditionName - Name of the condition to mock
 * @returns {Promise<Object>} Mock prediction results
 */
export const mockInferenceForCondition = async (conditionName) => {
  console.log(`[MockInference] Generating mock for condition: ${conditionName}`);

  // Find the condition in class labels
  const conditionIndex = MODEL_CONFIG.classLabels.findIndex(
    (label) => label.name.toLowerCase() === conditionName.toLowerCase()
  );

  if (conditionIndex === -1) {
    throw new Error(`Unknown condition: ${conditionName}`);
  }

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  // Generate predictions with specified condition as top result
  const confidences = MODEL_CONFIG.classLabels.map((_, index) => {
    if (index === conditionIndex) {
      return 0.85 + Math.random() * 0.10; // 85-95% for target condition
    } else {
      return 0.01 + Math.random() * 0.10; // Low confidence for others
    }
  });

  // Normalize
  const sum = confidences.reduce((a, b) => a + b, 0);
  const normalizedConfidences = confidences.map((c) => c / sum);

  const allPredictions = normalizedConfidences
    .map((confidence, index) => {
      const classInfo = MODEL_CONFIG.classLabels[index];
      return {
        classIndex: index,
        className: classInfo.name,
        confidence: confidence,
        percentage: (confidence * 100).toFixed(2),
        riskLevel: classInfo.risk,
        color: classInfo.color,
        description: classInfo.description,
        recommendation: classInfo.recommendation,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return {
    success: true,
    topPrediction: allPredictions[0],
    topKPredictions: allPredictions.slice(0, MODEL_CONFIG.output.topKResults),
    allPredictions,
    timestamp: new Date().toISOString(),
    isMockData: true,
  };
};

/**
 * Mock inference with custom confidence levels
 * Useful for testing UI with different confidence scenarios
 * 
 * @param {Object} options - Options for mock generation
 * @param {string} options.primaryCondition - Primary condition name
 * @param {number} options.confidence - Confidence level (0-1)
 * @returns {Promise<Object>} Mock prediction results
 */
export const mockInferenceWithConfidence = async ({ primaryCondition, confidence }) => {
  console.log(`[MockInference] Mock with ${(confidence * 100).toFixed(1)}% confidence for ${primaryCondition}`);

  const conditionIndex = MODEL_CONFIG.classLabels.findIndex(
    (label) => label.name.toLowerCase() === primaryCondition.toLowerCase()
  );

  if (conditionIndex === -1) {
    throw new Error(`Unknown condition: ${primaryCondition}`);
  }

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  // Generate predictions with specified confidence
  const remainingConfidence = 1 - confidence;
  const otherClassesCount = MODEL_CONFIG.output.numClasses - 1;
  
  const confidences = MODEL_CONFIG.classLabels.map((_, index) => {
    if (index === conditionIndex) {
      return confidence;
    } else {
      return remainingConfidence / otherClassesCount;
    }
  });

  const allPredictions = confidences
    .map((conf, index) => {
      const classInfo = MODEL_CONFIG.classLabels[index];
      return {
        classIndex: index,
        className: classInfo.name,
        confidence: conf,
        percentage: (conf * 100).toFixed(2),
        riskLevel: classInfo.risk,
        color: classInfo.color,
        description: classInfo.description,
        recommendation: classInfo.recommendation,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return {
    success: true,
    topPrediction: allPredictions[0],
    topKPredictions: allPredictions.slice(0, MODEL_CONFIG.output.topKResults),
    allPredictions,
    timestamp: new Date().toISOString(),
    isMockData: true,
  };
};

/**
 * Generate multiple mock predictions for testing list views
 * @param {number} count - Number of mock predictions to generate
 * @returns {Promise<Array>} Array of mock prediction results
 */
export const generateMockPredictionBatch = async (count = 5) => {
  console.log(`[MockInference] Generating ${count} mock predictions`);
  
  const predictions = [];
  
  for (let i = 0; i < count; i++) {
    const result = await mockInference(`mock_image_${i}.jpg`);
    predictions.push(result);
    
    // Small delay between generations
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  return predictions;
};

/**
 * Mock prediction scenarios for testing edge cases
 */
export const mockScenarios = {
  // High confidence melanoma (urgent case)
  highRiskMelanoma: () => 
    mockInferenceWithConfidence({ 
      primaryCondition: 'Melanoma', 
      confidence: 0.92 
    }),

  // Low confidence result (uncertain diagnosis)
  uncertainDiagnosis: () => 
    mockInferenceWithConfidence({ 
      primaryCondition: 'Melanocytic Nevus', 
      confidence: 0.45 
    }),

  // Benign case (low risk)
  benignCase: () => 
    mockInferenceWithConfidence({ 
      primaryCondition: 'Benign Keratosis', 
      confidence: 0.88 
    }),

  // Medium risk case
  mediumRiskCase: () => 
    mockInferenceWithConfidence({ 
      primaryCondition: 'Actinic Keratosis', 
      confidence: 0.76 
    }),
};

// Export default mock inference function
export default mockInference;
