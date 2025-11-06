// modelConfig.js - TensorFlow Lite Model Configuration
// This file contains all configuration details for the skin classification ML model

export const MODEL_CONFIG = {
  // Model Specifications
  modelInfo: {
    name: "MobileNetV2 Skin Classifier",
    version: "1.0",
    type: "image_classification",
    framework: "TensorFlow Lite",
    description: "Quantized MobileNetV2 model fine-tuned for skin lesion classification",
  },

  // Input Image Specifications
  input: {
    width: 224,
    height: 224,
    channels: 3, // RGB
    dataType: "uint8", // MobileNetV2 uses uint8 quantization
    
    // Normalization parameters (for uint8 quantized model)
    normalization: {
      mean: 127.5,
      std: 127.5,
      // Formula: normalized_value = (pixel_value - mean) / std
      // This converts [0, 255] to [-1, 1]
    },
  },

  // Output Specifications
  output: {
    numClasses: 7,
    confidenceThreshold: 0.60, // 60% minimum confidence
    topKResults: 3, // Show top 3 predictions
  },

  // Class Labels with Risk Levels
  classLabels: [
    {
      id: 0,
      name: "Melanoma",
      risk: "High",
      color: "#DC2626", // Red
      description: "Malignant tumor, requires immediate medical attention",
      recommendation: "Urgent: Consult dermatologist within 24-48 hours",
    },
    {
      id: 1,
      name: "Basal Cell Carcinoma",
      risk: "High",
      color: "#EA580C", // Orange-Red
      description: "Most common skin cancer, slow-growing but needs treatment",
      recommendation: "Schedule appointment with dermatologist within 1-2 weeks",
    },
    {
      id: 2,
      name: "Squamous Cell Carcinoma",
      risk: "High",
      color: "#DC2626", // Red
      description: "Second most common skin cancer, can spread if untreated",
      recommendation: "Consult dermatologist within 1 week",
    },
    {
      id: 3,
      name: "Actinic Keratosis",
      risk: "Medium",
      color: "#F59E0B", // Amber
      description: "Pre-cancerous lesion, may develop into cancer",
      recommendation: "Schedule dermatologist visit within 2-4 weeks",
    },
    {
      id: 4,
      name: "Benign Keratosis",
      risk: "Low",
      color: "#10B981", // Green
      description: "Non-cancerous growth, usually harmless",
      recommendation: "Monitor for changes, routine check-up recommended",
    },
    {
      id: 5,
      name: "Melanocytic Nevus",
      risk: "Low",
      color: "#10B981", // Green
      description: "Common mole, typically benign",
      recommendation: "Monitor for ABCDE changes, routine skin check",
    },
    {
      id: 6,
      name: "Vascular Lesion",
      risk: "Low",
      color: "#3B82F6", // Blue
      description: "Blood vessel-related lesion, usually benign",
      recommendation: "Monitor for changes, consult if growing or painful",
    },
  ],

  // Image Preprocessing Guidelines
  preprocessing: {
    required_steps: [
      "Resize to 224x224",
      "Convert to RGB (if grayscale or RGBA)",
      "Normalize pixel values",
      "Convert to tensor format",
    ],
    quality_checks: {
      min_image_size: 100, // Minimum 100x100 pixels
      max_file_size_mb: 10,
      allowed_formats: ["jpg", "jpeg", "png"],
      blur_threshold: 100, // Laplacian variance threshold
    },
  },

  // Performance Metrics
  performance: {
    expected_inference_time_ms: 200, // ~200ms on mid-range device
    model_size_mb: 3.5,
    requires_gpu: false,
    offline_capable: true,
  },

  // ABCDE Rule for Melanoma Detection (Educational Reference)
  melanoma_abcde: {
    A: "Asymmetry - One half doesn't match the other",
    B: "Border - Irregular, scalloped, or poorly defined edges",
    C: "Color - Varies from one area to another; shades of tan, brown, black",
    D: "Diameter - Larger than 6mm (pencil eraser size)",
    E: "Evolving - Changes in size, shape, color, or symptoms",
  },
};

// Helper function to get class info by ID
export const getClassInfo = (classId) => {
  return MODEL_CONFIG.classLabels.find((label) => label.id === classId) || null;
};

// Helper function to get class info by name
export const getClassByName = (className) => {
  return MODEL_CONFIG.classLabels.find(
    (label) => label.name.toLowerCase() === className.toLowerCase()
  ) || null;
};

// Helper function to determine if confidence is acceptable
export const isConfidenceAcceptable = (confidence) => {
  return confidence >= MODEL_CONFIG.output.confidenceThreshold;
};
