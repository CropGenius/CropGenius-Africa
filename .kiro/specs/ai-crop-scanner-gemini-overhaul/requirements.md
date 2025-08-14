# AI Crop Scanner - Gemini-2.5-Flash Overhaul Requirements

## Introduction

This specification outlines the complete overhaul of the AI crop scanner system, replacing the dual PlantNet + Gemini pipeline with a single, lightning-fast Gemini-2.5-Flash LIVE implementation. The current system suffers from rate limiting (500/day), mock data contamination, and unnecessary complexity. This overhaul will deliver a production-ready, single-API diagnosis engine with zero rate limits and real-time crop intelligence.

## Requirements

### Requirement 1: Remove Legacy PlantNet Infrastructure

**User Story:** As a system architect, I want to eliminate all PlantNet dependencies so that the system has no rate limits and reduced complexity.

#### Acceptance Criteria

1. WHEN the system processes an image THEN it SHALL NOT make any calls to PlantNet API
2. WHEN reviewing the codebase THEN there SHALL be no PlantNet imports, functions, or references
3. WHEN the system fails THEN it SHALL NOT fall back to PlantNet-based analysis
4. WHEN checking environment variables THEN VITE_PLANTNET_API_KEY SHALL be unused
5. WHEN analyzing the data flow THEN there SHALL be only one API call per diagnosis

### Requirement 2: Implement Gemini-2.5-Flash Direct Image Analysis

**User Story:** As a farmer, I want instant crop disease diagnosis from a single AI model so that I get faster, more accurate results.

#### Acceptance Criteria

1. WHEN I upload an image THEN the system SHALL send it directly to Gemini-2.5-Flash API
2. WHEN the API processes the image THEN it SHALL return disease name, confidence, symptoms, and treatment in one response
3. WHEN the system makes the API call THEN it SHALL use the endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
4. WHEN sending the payload THEN it SHALL include both text prompt and inline image data
5. WHEN the response is received THEN it SHALL parse structured diagnosis information

### Requirement 3: Eliminate Mock Data and Fake Responses

**User Story:** As a farmer, I want real AI analysis results so that I can trust the diagnosis and take appropriate action.

#### Acceptance Criteria

1. WHEN the system processes any image THEN it SHALL return real AI analysis results
2. WHEN reviewing `use-disease-detection.ts` THEN there SHALL be no hardcoded mock responses
3. WHEN the system encounters an error THEN it SHALL return actual error messages, not fake success data
4. WHEN testing the system THEN all responses SHALL come from live Gemini API calls
5. WHEN a user scans a crop THEN the confidence scores SHALL reflect actual AI analysis

### Requirement 4: Optimize Image Processing Pipeline

**User Story:** As a system administrator, I want optimized image processing so that API calls are faster and more cost-effective.

#### Acceptance Criteria

1. WHEN an image is captured THEN it SHALL be compressed to JPEG format before base64 conversion
2. WHEN the image size exceeds 1MB THEN it SHALL be automatically resized while maintaining quality
3. WHEN converting to base64 THEN the payload size SHALL be minimized for faster transmission
4. WHEN processing multiple images THEN the system SHALL handle batch operations efficiently
5. WHEN the image is processed THEN it SHALL maintain sufficient quality for accurate diagnosis

### Requirement 5: Preserve Existing UI/UX Experience

**User Story:** As a farmer, I want the same intuitive interface so that I don't need to relearn how to use the scanner.

#### Acceptance Criteria

1. WHEN I access the scanner THEN the camera and upload buttons SHALL function identically
2. WHEN I capture an image THEN the scanning animation and progress indicators SHALL remain unchanged
3. WHEN results are displayed THEN the layout, colors, and information structure SHALL be preserved
4. WHEN I navigate the interface THEN all existing buttons and actions SHALL work as before
5. WHEN viewing results THEN the disease information, treatment options, and economic impact SHALL display in the same format

### Requirement 6: Implement Smart Caching System

**User Story:** As a system administrator, I want intelligent caching so that repeated scans are instant and API costs are minimized.

#### Acceptance Criteria

1. WHEN the same image is scanned twice THEN the second scan SHALL return cached results instantly
2. WHEN the cache reaches capacity THEN it SHALL automatically remove oldest entries
3. WHEN 24 hours pass THEN cached results SHALL expire and trigger fresh analysis
4. WHEN the system starts THEN it SHALL load existing cache data from local storage
5. WHEN caching results THEN it SHALL include image hash, crop type, and diagnosis data

### Requirement 7: Enhance Diagnosis Accuracy and Depth

**User Story:** As a farmer, I want comprehensive disease analysis so that I can make informed treatment decisions.

#### Acceptance Criteria

1. WHEN the AI analyzes an image THEN it SHALL provide disease name with scientific classification
2. WHEN diagnosis is complete THEN it SHALL include confidence percentage, severity level, and affected area
3. WHEN treatment is recommended THEN it SHALL provide both organic and chemical options

### Requirement 8: Implement GPS Location Integration

**User Story:** As a farmer, I want location-aware recommendations so that I get locally relevant treatment options and suppliers.

#### Acceptance Criteria

1. WHEN I scan a crop THEN the system SHALL capture my GPS coordinates
2. WHEN generating recommendations THEN it SHALL consider local climate and disease patterns
3. WHEN providing treatment advice THEN it SHALL account for regional agricultural practices
4. WHEN storing scan history THEN it SHALL include location data for trend analysis

### Requirement 9: Enable Disease History Tracking

**User Story:** As a farmer, I want to track disease patterns over time so that I can implement better prevention strategies.

#### Acceptance Criteria

1. WHEN I complete a scan THEN it SHALL be automatically saved to my disease history
2. WHEN viewing history THEN I SHALL see chronological list of all previous scans
3. WHEN analyzing trends THEN the system SHALL identify recurring disease patterns
4. WHEN reviewing past scans THEN I SHALL see images, diagnoses, and treatment outcomes
5. WHEN exporting data THEN I SHALL be able to share history with agricultural advisors

### Requirement 10: Consolidate Component Architecture

**User Story:** As a developer, I want a single, clean scanner component so that maintenance is simplified and code duplication is eliminated.

#### Acceptance Criteria

1. WHEN reviewing the codebase THEN there SHALL be only one CropScanner component
2. WHEN CropScannerFixed.tsx is removed THEN all functionality SHALL be preserved in CropScanner.tsx
3. WHEN the component is updated THEN changes SHALL only need to be made in one location
4. WHEN testing the scanner THEN all features SHALL work from the consolidated component
5. WHEN deploying updates THEN there SHALL be no duplicate or conflicting scanner logic