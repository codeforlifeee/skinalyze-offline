// test-ml-inference.js
// Quick test script to verify ML inference is working

import mockInference, { mockScenarios } from './src/ml/mockInference';

console.log('==============================================');
console.log('🧪 Testing ML Inference Service');
console.log('==============================================\n');

async function runTests() {
  try {
    // Test 1: Basic Mock Inference
    console.log('📋 Test 1: Basic Mock Inference');
    const result1 = await mockInference('test_image.jpg');
    
    if (result1.success) {
      console.log('✅ PASSED');
      console.log(`   Top Prediction: ${result1.topPrediction.className}`);
      console.log(`   Confidence: ${result1.topPrediction.percentage}%`);
      console.log(`   Risk Level: ${result1.topPrediction.riskLevel}`);
      console.log(`   Is Mock: ${result1.isMockData}`);
    } else {
      console.log('❌ FAILED:', result1.error);
    }
    
    console.log('');
    
    // Test 2: High Risk Scenario
    console.log('📋 Test 2: High Risk Melanoma Scenario');
    const result2 = await mockScenarios.highRiskMelanoma();
    
    if (result2.success) {
      console.log('✅ PASSED');
      console.log(`   Condition: ${result2.topPrediction.className}`);
      console.log(`   Confidence: ${result2.topPrediction.percentage}%`);
      console.log(`   Recommendation: ${result2.topPrediction.recommendation}`);
    } else {
      console.log('❌ FAILED:', result2.error);
    }
    
    console.log('');
    
    // Test 3: Benign Case
    console.log('📋 Test 3: Benign Case Scenario');
    const result3 = await mockScenarios.benignCase();
    
    if (result3.success) {
      console.log('✅ PASSED');
      console.log(`   Condition: ${result3.topPrediction.className}`);
      console.log(`   Confidence: ${result3.topPrediction.percentage}%`);
      console.log(`   Risk Level: ${result3.topPrediction.riskLevel}`);
    } else {
      console.log('❌ FAILED:', result3.error);
    }
    
    console.log('');
    
    // Test 4: Uncertain Diagnosis
    console.log('📋 Test 4: Uncertain Diagnosis Scenario');
    const result4 = await mockScenarios.uncertainDiagnosis();
    
    if (result4.success) {
      console.log('✅ PASSED');
      console.log(`   Condition: ${result4.topPrediction.className}`);
      console.log(`   Confidence: ${result4.topPrediction.percentage}%`);
      
      if (parseFloat(result4.topPrediction.percentage) < 60) {
        console.log('   ⚠️  Low confidence - uncertain diagnosis');
      }
    } else {
      console.log('❌ FAILED:', result4.error);
    }
    
    console.log('\n==============================================');
    console.log('🎉 All Tests Completed!');
    console.log('==============================================');
    console.log('\n📝 Next Steps:');
    console.log('   1. Check ML_INFERENCE_USAGE_EXAMPLES.js for more examples');
    console.log('   2. Read Readme/ML_QUICKSTART.md for quick start guide');
    console.log('   3. Read Readme/PHASE4_COMPLETE.md for full documentation');
    console.log('   4. Install tflite-react-native for real inference');
    
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error);
    console.error(error.stack);
  }
}

// Run tests
runTests();

export default runTests;
