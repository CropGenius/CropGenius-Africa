# Requirements Document

## Introduction

Transform the CropGenius main dashboard from containing any placeholder content to being fully production-ready with real, dynamic data. The dashboard must always display the user's precise current location, real-time weather data, actual field count, and eliminate all fake greetings or static content. Every piece of information shown must be live, accurate, and personalized to the specific user.

## Requirements

### Requirement 1

**User Story:** As a farmer using CropGenius, I want the dashboard to always show my exact current location, so that all weather and agricultural data is relevant to where I actually am.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL automatically detect and display the user's precise GPS coordinates
2. WHEN GPS is unavailable THEN the system SHALL fall back to IP-based location detection
3. WHEN location is detected THEN the system SHALL display the actual city/region name instead of hardcoded "Kakamega, Kenya"
4. WHEN location changes THEN the system SHALL automatically update all location-dependent data within 30 seconds
5. IF location detection fails THEN the system SHALL prompt the user to manually set their location

### Requirement 2

**User Story:** As a farmer, I want the dashboard greeting to be personalized and contextually relevant, so that it feels like a real agricultural assistant rather than a generic placeholder.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a greeting using the user's actual name from their profile
2. WHEN no user name is available THEN the system SHALL use "Farmer" as fallback instead of generic placeholders
3. WHEN it's morning (6AM-12PM) THEN the system SHALL show "Good morning"
4. WHEN it's afternoon (12PM-6PM) THEN the system SHALL show "Good afternoon"  
5. WHEN it's evening (6PM-6AM) THEN the system SHALL show "Good evening"
6. WHEN the greeting is displayed THEN it SHALL never show placeholder text like "CropGenius Africa"

### Requirement 3

**User Story:** As a farmer, I want to see my actual field count and real weather conditions, so that I can make informed decisions based on current data.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display the exact number of fields the user has created
2. WHEN the user has 0 fields THEN the system SHALL show "0 fields synced" and prompt to add fields
3. WHEN weather data is loading THEN the system SHALL show "Loading weather..." instead of placeholder temperatures
4. WHEN weather data loads THEN the system SHALL display real temperature, conditions, and location-specific weather
5. WHEN weather API fails THEN the system SHALL show "Weather unavailable" instead of fake data

### Requirement 4

**User Story:** As a farmer, I want all dashboard widgets to show real data or clear loading states, so that I never see misleading placeholder information.

#### Acceptance Criteria

1. WHEN any data is loading THEN the system SHALL show appropriate loading indicators
2. WHEN data fails to load THEN the system SHALL show clear error messages with retry options
3. WHEN the Farm Profit & Sustainability Index is calculated THEN it SHALL be based on real field analysis data
4. WHEN Today's Genius Action is generated THEN it SHALL be based on actual weather conditions and field data
5. WHEN Priority Alerts are shown THEN they SHALL be based on real weather and field conditions

### Requirement 5

**User Story:** As a farmer, I want the dashboard to continuously track my location and update data accordingly, so that the information remains accurate as I move between fields.

#### Acceptance Criteria

1. WHEN the user moves to a different location THEN the system SHALL detect the location change within 2 minutes
2. WHEN location changes significantly (>1km) THEN the system SHALL update weather data for the new location
3. WHEN the user grants location permissions THEN the system SHALL continuously track location in the background
4. WHEN location tracking is active THEN the system SHALL update the location display in real-time
5. IF the user denies location permissions THEN the system SHALL explain why location is needed and offer manual location entry

### Requirement 6

**User Story:** As a farmer, I want all market intelligence and agricultural recommendations to be based on my actual location and field data, so that the advice is relevant and actionable.

#### Acceptance Criteria

1. WHEN market prices are displayed THEN they SHALL be for the user's actual geographic region
2. WHEN agricultural recommendations are made THEN they SHALL consider the user's specific location climate
3. WHEN disease alerts are generated THEN they SHALL be based on local weather conditions that promote disease
4. WHEN planting recommendations are made THEN they SHALL consider local seasonal patterns
5. WHEN irrigation advice is given THEN it SHALL be based on real soil moisture and weather forecasts for the user's location