// ============================================================
// MediVision AI – AI Model Configuration Registry
// Each category defines its full model pipeline.
// Prediction engine dynamically loads configs at runtime.
// ============================================================

import type { MedicalCategory, Severity } from '@/lib/types';

export type PreprocessingStep =
  | 'resize_224'
  | 'resize_256'
  | 'resize_512'
  | 'normalize_imagenet'
  | 'normalize_zero_one'
  | 'enhance_contrast'
  | 'noise_removal'
  | 'clahe'
  | 'histogram_equalization';

export type ExplainabilityMethod = 'gradcam' | 'gradcam++' | 'eigencam' | 'scorecam' | 'unet_segmentation';

export interface SeverityMapping {
  [conditionKey: string]: Severity;
}

export interface AIModelConfig {
  modelName: string;
  architecture: string;
  confidenceThreshold: number;
  preprocessingPipeline: PreprocessingStep[];
  explainabilityMethod: ExplainabilityMethod;
  supportedFormats: string[];
  outputClasses: string[];
  severityMapping: SeverityMapping;
  specialist: string;
  inputSize: [number, number];
}

export const AI_MODEL_REGISTRY: Record<MedicalCategory, AIModelConfig> = {
  skin: {
    modelName: 'efficientnet-b4-skin-v1',
    architecture: 'EfficientNet-B4',
    confidenceThreshold: 0.65,
    preprocessingPipeline: ['resize_224', 'normalize_imagenet', 'enhance_contrast'],
    explainabilityMethod: 'gradcam++',
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    inputSize: [224, 224],
    outputClasses: ['Psoriasis', 'Eczema', 'Melanoma', 'Acne Vulgaris', 'Rosacea', 'Tinea', 'Vitiligo', 'Seborrheic Dermatitis'],
    severityMapping: {
      Melanoma: 'critical',
      Psoriasis: 'moderate',
      Eczema: 'mild',
      'Acne Vulgaris': 'mild',
      Rosacea: 'mild',
      Tinea: 'mild',
      Vitiligo: 'moderate',
      'Seborrheic Dermatitis': 'mild',
    },
    specialist: 'Dermatologist',
  },
  eye: {
    modelName: 'densenet121-eye-v1',
    architecture: 'DenseNet-121',
    confidenceThreshold: 0.70,
    preprocessingPipeline: ['resize_224', 'normalize_imagenet', 'clahe'],
    explainabilityMethod: 'gradcam',
    supportedFormats: ['jpg', 'jpeg', 'png'],
    inputSize: [224, 224],
    outputClasses: ['Diabetic Retinopathy', 'Glaucoma', 'Cataract', 'Macular Degeneration', 'Conjunctivitis'],
    severityMapping: {
      'Diabetic Retinopathy': 'severe',
      Glaucoma: 'severe',
      Cataract: 'moderate',
      'Macular Degeneration': 'severe',
      Conjunctivitis: 'mild',
    },
    specialist: 'Ophthalmologist',
  },
  chest: {
    modelName: 'vit-base-chest-v1',
    architecture: 'Vision Transformer (ViT-Base)',
    confidenceThreshold: 0.75,
    preprocessingPipeline: ['resize_256', 'normalize_zero_one', 'histogram_equalization'],
    explainabilityMethod: 'eigencam',
    supportedFormats: ['jpg', 'jpeg', 'png', 'dicom'],
    inputSize: [256, 256],
    outputClasses: ['Pneumonia', 'Tuberculosis', 'COVID-19', 'Pleural Effusion', 'Normal'],
    severityMapping: {
      Pneumonia: 'severe',
      Tuberculosis: 'severe',
      'COVID-19': 'critical',
      'Pleural Effusion': 'severe',
      Normal: 'mild',
    },
    specialist: 'Pulmonologist',
  },
  dental: {
    modelName: 'yolov8n-dental-v1',
    architecture: 'YOLOv8 Nano',
    confidenceThreshold: 0.60,
    preprocessingPipeline: ['resize_512', 'normalize_zero_one'],
    explainabilityMethod: 'gradcam',
    supportedFormats: ['jpg', 'jpeg', 'png'],
    inputSize: [512, 512],
    outputClasses: ['Dental Caries', 'Gingivitis', 'Periodontitis', 'Dental Abscess', 'Tooth Fracture'],
    severityMapping: {
      'Dental Caries': 'moderate',
      Gingivitis: 'mild',
      Periodontitis: 'severe',
      'Dental Abscess': 'critical',
      'Tooth Fracture': 'severe',
    },
    specialist: 'Dentist / Oral Surgeon',
  },
  oral: {
    modelName: 'efficientnet-b3-oral-v1',
    architecture: 'EfficientNet-B3',
    confidenceThreshold: 0.65,
    preprocessingPipeline: ['resize_224', 'normalize_imagenet', 'enhance_contrast'],
    explainabilityMethod: 'gradcam++',
    supportedFormats: ['jpg', 'jpeg', 'png'],
    inputSize: [224, 224],
    outputClasses: ['Oral Ulcer', 'Oral Cancer', 'Thrush', 'Leukoplakia', 'Stomatitis'],
    severityMapping: {
      'Oral Cancer': 'critical',
      Leukoplakia: 'severe',
      Thrush: 'mild',
      'Oral Ulcer': 'mild',
      Stomatitis: 'moderate',
    },
    specialist: 'Oral Oncologist / Dentist',
  },
  burns: {
    modelName: 'unet-burns-v1',
    architecture: 'U-Net',
    confidenceThreshold: 0.70,
    preprocessingPipeline: ['resize_256', 'normalize_zero_one', 'enhance_contrast'],
    explainabilityMethod: 'unet_segmentation',
    supportedFormats: ['jpg', 'jpeg', 'png'],
    inputSize: [256, 256],
    outputClasses: ['First Degree Burn', 'Second Degree Burn', 'Third Degree Burn'],
    severityMapping: {
      'First Degree Burn': 'mild',
      'Second Degree Burn': 'moderate',
      'Third Degree Burn': 'critical',
    },
    specialist: 'Burns Specialist / Plastic Surgeon',
  },
  wounds: {
    modelName: 'unet-wounds-v1',
    architecture: 'U-Net',
    confidenceThreshold: 0.65,
    preprocessingPipeline: ['resize_256', 'normalize_zero_one', 'noise_removal'],
    explainabilityMethod: 'unet_segmentation',
    supportedFormats: ['jpg', 'jpeg', 'png'],
    inputSize: [256, 256],
    outputClasses: ['Laceration', 'Abrasion', 'Puncture Wound', 'Infected Wound', 'Pressure Ulcer'],
    severityMapping: {
      Laceration: 'moderate',
      Abrasion: 'mild',
      'Puncture Wound': 'moderate',
      'Infected Wound': 'severe',
      'Pressure Ulcer': 'severe',
    },
    specialist: 'General Surgeon / Wound Care Specialist',
  },
};

export function getModelConfig(category: MedicalCategory): AIModelConfig {
  return AI_MODEL_REGISTRY[category];
}

export function getSpecialist(category: MedicalCategory): string {
  return AI_MODEL_REGISTRY[category].specialist;
}

export function getSeverity(category: MedicalCategory, condition: string): Severity {
  return AI_MODEL_REGISTRY[category].severityMapping[condition] ?? 'mild';
}
