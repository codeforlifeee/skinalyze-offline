# TFLite Model Setup Instructions

## ⚠️ IMPORTANT: Model File Required

This app requires a TensorFlow Lite model file to perform skin lesion classification.

### Current Status: **MODEL FILE NOT INCLUDED**

Due to file size limitations, the actual `.tflite` model file is not included in this repository.

---

## Option 1: Download Pre-trained Skin Classification Model (RECOMMENDED)

### Step 1: Download the Model
Download a pre-trained MobileNetV2 model for skin lesion classification:

**Recommended Sources:**
1. **HAM10000 Skin Lesion Model**: 
   - GitHub: https://github.com/junaid54541/Skin-Cancer-Classification-Tflite-Model
   - Direct download: Look for `skin_classifier.tflite` or similar

2. **ISIC Archive Models**:
   - Visit: https://www.isic-archive.com/
   - Look for pre-trained TFLite models

3. **TensorFlow Hub**:
   - URL: https://tfhub.dev/
   - Search for "skin lesion classification" or "dermatology"

### Step 2: Place the Model File
1. Download the `.tflite` file
2. Rename it to `skin_classifier.tflite`
3. Place it in: `app-offline/assets/models/`
4. Final path should be: `app-offline/assets/models/skin_classifier.tflite`

---

## Option 2: Use Generic MobileNetV2 (For Testing Only)

If you want to test the app infrastructure without a specialized model:

### Windows PowerShell:
```powershell
cd c:\Users\LENOVO\Desktop\Codeutsava\app-offline\assets\models

# Download MobileNetV2 Quantized model
Invoke-WebRequest -Uri "https://storage.googleapis.com/download.tensorflow.org/models/mobilenet_v2_1.0_224_quant.tflite" -OutFile "skin_classifier.tflite"
```

### Using curl (if installed):
```bash
cd assets/models
curl -L "https://storage.googleapis.com/download.tensorflow.org/models/mobilenet_v2_1.0_224_quant.tflite" -o skin_classifier.tflite
```

**Note**: This generic model is trained on ImageNet, NOT skin lesions. It's only for testing the app infrastructure.

---

## Option 3: Train Your Own Model

If you want to train a custom model:

### Requirements:
- Python 3.8+
- TensorFlow 2.x
- Dataset (e.g., HAM10000, ISIC)

### Quick Training Script (Python):
```python
import tensorflow as tf
from tensorflow import keras
import numpy as np

# 1. Load and preprocess your skin lesion dataset
# (You'll need to implement this based on your dataset)

# 2. Create MobileNetV2 model
base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

model = keras.Sequential([
    base_model,
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(7, activation='softmax')  # 7 classes
])

# 3. Train model
# model.fit(train_data, epochs=10, validation_data=val_data)

# 4. Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# 5. Save model
with open('skin_classifier.tflite', 'wb') as f:
    f.write(tflite_model)
```

---

## Model Specifications

Your model should meet these requirements:

| Property | Value |
|----------|-------|
| **Input Shape** | 224 x 224 x 3 (RGB) |
| **Input Type** | uint8 (quantized) or float32 |
| **Output Classes** | 7 (configurable in `src/ml/modelConfig.js`) |
| **Max File Size** | < 50 MB (recommended) |
| **Format** | TensorFlow Lite (.tflite) |

---

## Verify Model Installation

After placing the model file, verify it exists:

### Windows PowerShell:
```powershell
Test-Path "c:\Users\LENOVO\Desktop\Codeutsava\app-offline\assets\models\skin_classifier.tflite"
```

Should return: `True`

### Check file size:
```powershell
Get-Item "c:\Users\LENOVO\Desktop\Codeutsava\app-offline\assets\models\skin_classifier.tflite" | Select-Object Length
```

---

## Update Model Configuration

If your model has different specifications, update `src/ml/modelConfig.js`:

```javascript
export const MODEL_CONFIG = {
  input: {
    width: 224,        // Change if different
    height: 224,       // Change if different
    channels: 3,
    dataType: "uint8", // Change to "float32" if not quantized
  },
  output: {
    numClasses: 7,     // Change based on your model
  },
  classLabels: [
    // Update with your model's class names
  ],
};
```

---

## Troubleshooting

### Model not loading?
1. Check file path is correct
2. Verify file is valid `.tflite` format
3. Check console logs for specific error messages

### Wrong predictions?
1. Verify input preprocessing matches training
2. Check class label order matches model output
3. Adjust confidence threshold in `modelConfig.js`

### App crashes on inference?
1. Ensure model file isn't corrupted
2. Check model input/output shapes match configuration
3. Verify device has enough memory

---

## Next Steps

Once the model is in place:
1. ✅ Verify file exists in `assets/models/`
2. ✅ Update `src/ml/modelConfig.js` if needed
3. ✅ Test inference with sample images
4. ✅ Calibrate confidence thresholds

---

## Current Model Info

**Status**: ⚠️ **No model file present**
**Expected Location**: `assets/models/skin_classifier.tflite`
**Size**: N/A
**Last Updated**: Not yet added

---

*This file will be updated once a model is successfully integrated.*
