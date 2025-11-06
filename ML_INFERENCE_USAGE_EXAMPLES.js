// ML_INFERENCE_USAGE_EXAMPLES.js
// Comprehensive examples for using the ML inference services

// ==================== IMPORTS ====================
import { inferenceEngine } from './src/ml/inferenceEngine';
import mockInference, { 
  mockInferenceForCondition, 
  mockInferenceWithConfidence,
  mockScenarios 
} from './src/ml/mockInference';

// ==================== EXAMPLE 1: REAL TFLITE INFERENCE ====================
// Using the native TFLite inference engine

async function example1_RealInference() {
  console.log('=== Example 1: Real TFLite Inference ===');
  
  try {
    // Step 1: Initialize the model (do this once when app starts)
    console.log('Initializing TFLite model...');
    const initialized = await inferenceEngine.initialize();
    
    if (!initialized) {
      throw new Error('Failed to initialize model');
    }
    
    console.log('Model initialized successfully!');
    
    // Step 2: Get model information
    const modelInfo = inferenceEngine.getModelInfo();
    console.log('Model Info:', modelInfo);
    
    // Step 3: Validate image before inference
    const imagePath = 'file:///path/to/skin/lesion/image.jpg';
    const validation = await inferenceEngine.validateImage(imagePath);
    
    if (!validation.valid) {
      console.error('Image validation failed:', validation.error);
      return;
    }
    
    // Step 4: Run inference
    console.log('Running inference...');
    const result = await inferenceEngine.predict(imagePath);
    
    if (result.success) {
      console.log('\n🎯 Top Prediction:');
      console.log('  Condition:', result.topPrediction.className);
      console.log('  Confidence:', result.topPrediction.percentage + '%');
      console.log('  Risk Level:', result.topPrediction.riskLevel);
      console.log('  Recommendation:', result.topPrediction.recommendation);
      
      console.log('\n📊 All Predictions:');
      result.allPredictions.forEach((pred, index) => {
        console.log(`  ${index + 1}. ${pred.className}: ${pred.percentage}%`);
      });
      
      console.log('\n⏱️  Inference Time:', result.inferenceTime + 'ms');
    } else {
      console.error('Inference failed:', result.error);
    }
    
    // Step 5: Cleanup when done (optional, on app exit)
    // inferenceEngine.cleanup();
    
  } catch (error) {
    console.error('Error in real inference example:', error);
  }
}

// ==================== EXAMPLE 2: MOCK INFERENCE (TESTING) ====================
// Using mock inference for testing without a real model

async function example2_MockInference() {
  console.log('\n=== Example 2: Mock Inference ===');
  
  try {
    const imagePath = 'file:///test/image.jpg';
    
    // Run mock inference
    const result = await mockInference(imagePath);
    
    console.log('Mock Inference Result:');
    console.log('  Is Mock Data:', result.isMockData);
    console.log('  Top Prediction:', result.topPrediction.className);
    console.log('  Confidence:', result.topPrediction.percentage + '%');
    console.log('  Risk Level:', result.topPrediction.riskLevel);
    
  } catch (error) {
    console.error('Error in mock inference:', error);
  }
}

// ==================== EXAMPLE 3: MOCK SPECIFIC CONDITION ====================
// Test with a specific condition for UI development

async function example3_MockSpecificCondition() {
  console.log('\n=== Example 3: Mock Specific Condition ===');
  
  try {
    // Generate mock result for Melanoma
    const result = await mockInferenceForCondition('Melanoma');
    
    console.log('Mocked Melanoma Detection:');
    console.log('  Condition:', result.topPrediction.className);
    console.log('  Confidence:', result.topPrediction.percentage + '%');
    console.log('  Description:', result.topPrediction.description);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ==================== EXAMPLE 4: MOCK WITH CUSTOM CONFIDENCE ====================
// Test different confidence levels

async function example4_MockCustomConfidence() {
  console.log('\n=== Example 4: Mock Custom Confidence ===');
  
  try {
    // Test high confidence scenario
    const highConfidence = await mockInferenceWithConfidence({
      primaryCondition: 'Benign Keratosis',
      confidence: 0.95 // 95% confidence
    });
    
    console.log('High Confidence Result:');
    console.log('  Condition:', highConfidence.topPrediction.className);
    console.log('  Confidence:', highConfidence.topPrediction.percentage + '%');
    
    // Test low confidence scenario
    const lowConfidence = await mockInferenceWithConfidence({
      primaryCondition: 'Melanocytic Nevus',
      confidence: 0.45 // 45% confidence (uncertain)
    });
    
    console.log('\nLow Confidence Result:');
    console.log('  Condition:', lowConfidence.topPrediction.className);
    console.log('  Confidence:', lowConfidence.topPrediction.percentage + '%');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ==================== EXAMPLE 5: PRE-DEFINED SCENARIOS ====================
// Test with pre-defined edge case scenarios

async function example5_MockScenarios() {
  console.log('\n=== Example 5: Mock Scenarios ===');
  
  try {
    // High risk melanoma
    const melanoma = await mockScenarios.highRiskMelanoma();
    console.log('High Risk Melanoma:', melanoma.topPrediction.className, '-', melanoma.topPrediction.percentage + '%');
    
    // Uncertain diagnosis
    const uncertain = await mockScenarios.uncertainDiagnosis();
    console.log('Uncertain Diagnosis:', uncertain.topPrediction.className, '-', uncertain.topPrediction.percentage + '%');
    
    // Benign case
    const benign = await mockScenarios.benignCase();
    console.log('Benign Case:', benign.topPrediction.className, '-', benign.topPrediction.percentage + '%');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ==================== EXAMPLE 6: REACT NATIVE COMPONENT INTEGRATION ====================
// How to use inference in a React Native component

/*
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ActivityIndicator } from 'react-native';
import { inferenceEngine } from '../ml/inferenceEngine';
import mockInference from '../ml/mockInference';

const DiagnosisScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [useMock, setUseMock] = useState(true); // Toggle between mock and real

  // Initialize model on mount
  useEffect(() => {
    if (!useMock) {
      initializeModel();
    }
  }, [useMock]);

  const initializeModel = async () => {
    try {
      const success = await inferenceEngine.initialize();
      if (!success) {
        console.error('Failed to initialize model');
      }
    } catch (error) {
      console.error('Model initialization error:', error);
    }
  };

  const runDiagnosis = async () => {
    if (!imageUri) {
      alert('Please select an image first');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let predictionResult;

      if (useMock) {
        // Use mock inference for testing
        predictionResult = await mockInference(imageUri);
      } else {
        // Use real TFLite inference
        predictionResult = await inferenceEngine.predict(imageUri);
      }

      if (predictionResult.success) {
        setResult(predictionResult);
      } else {
        alert('Diagnosis failed: ' + predictionResult.error);
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      alert('An error occurred during diagnosis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Skin Diagnosis</Text>
      
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />
      )}

      <Button title="Select Image" onPress={() => {}} />
      <Button title="Run Diagnosis" onPress={runDiagnosis} disabled={!imageUri} />
      <Button 
        title={`Mode: ${useMock ? 'Mock' : 'Real'}`} 
        onPress={() => setUseMock(!useMock)} 
      />

      {isLoading && <ActivityIndicator size="large" />}

      {result && result.topPrediction && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Diagnosis: {result.topPrediction.className}
          </Text>
          <Text>Confidence: {result.topPrediction.percentage}%</Text>
          <Text>Risk Level: {result.topPrediction.riskLevel}</Text>
          <Text>Recommendation: {result.topPrediction.recommendation}</Text>
          
          {result.isMockData && (
            <Text style={{ color: 'orange' }}>⚠️ Mock Data (Testing)</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default DiagnosisScreen;
*/

// ==================== EXAMPLE 7: SAVE DIAGNOSIS TO BACKEND ====================
// Combine ML inference with backend API

async function example7_SaveDiagnosis() {
  console.log('\n=== Example 7: Save Diagnosis to Backend ===');
  
  try {
    // Import services
    const { clinicianService } = require('./src/services/api');
    const { storageService } = require('./src/services/storageService');
    
    const imagePath = 'file:///path/to/image.jpg';
    
    // Run inference
    const result = await mockInference(imagePath); // or inferenceEngine.predict(imagePath)
    
    if (result.success) {
      // Prepare diagnosis data
      const diagnosisData = {
        patientId: 'patient_123',
        imageUri: imagePath,
        prediction: result.topPrediction.className,
        confidence: result.topPrediction.confidence,
        riskLevel: result.topPrediction.riskLevel,
        allPredictions: result.allPredictions,
        timestamp: result.timestamp,
        inferenceTime: result.inferenceTime,
        modelType: result.modelType,
      };
      
      // Save to backend
      try {
        const backendResponse = await clinicianService.saveDiagnosis(diagnosisData);
        console.log('Diagnosis saved to backend:', backendResponse);
      } catch (error) {
        console.warn('Backend save failed, saving locally:', error.message);
      }
      
      // Always save locally for offline access
      await storageService.saveDiagnosis(diagnosisData);
      console.log('Diagnosis saved locally');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ==================== EXAMPLE 8: BATCH PROCESSING ====================
// Process multiple images

async function example8_BatchProcessing() {
  console.log('\n=== Example 8: Batch Processing ===');
  
  const imageUrls = [
    'file:///image1.jpg',
    'file:///image2.jpg',
    'file:///image3.jpg',
  ];
  
  const results = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const result = await mockInference(imageUrl); // or inferenceEngine.predict(imageUrl)
      results.push({
        image: imageUrl,
        diagnosis: result.topPrediction.className,
        confidence: result.topPrediction.percentage,
      });
      
      console.log(`Processed ${imageUrl}: ${result.topPrediction.className}`);
      
    } catch (error) {
      console.error(`Failed to process ${imageUrl}:`, error);
    }
  }
  
  console.log('\nBatch Results:', results);
}

// ==================== RUN EXAMPLES ====================

// Uncomment to run examples:
// example1_RealInference();
// example2_MockInference();
// example3_MockSpecificCondition();
// example4_MockCustomConfidence();
// example5_MockScenarios();
// example7_SaveDiagnosis();
// example8_BatchProcessing();

export {
  example1_RealInference,
  example2_MockInference,
  example3_MockSpecificCondition,
  example4_MockCustomConfidence,
  example5_MockScenarios,
  example7_SaveDiagnosis,
  example8_BatchProcessing,
};
