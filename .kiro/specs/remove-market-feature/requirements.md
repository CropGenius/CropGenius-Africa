# Requirements Document

## Introduction

This feature involves completely removing the duplicate Market feature from CropGenius and replacing it with the Fields feature in the bottom navigation. The Market feature is currently duplicated in the navigation and needs to be eliminated to simplify the user experience and let the Fields feature take its prominent place in the bottom navigation.

## Requirements

### Requirement 1

**User Story:** As a farmer using CropGenius, I want the bottom navigation to show Fields instead of Market, so that I can quickly access my field management without confusion from duplicate features.

#### Acceptance Criteria

1. WHEN I view the bottom navigation THEN I SHALL see Fields instead of Market as the fifth navigation item
2. WHEN I tap the Fields icon in bottom navigation THEN I SHALL navigate to the Fields page (/fields)
3. WHEN I view the bottom navigation THEN the Fields icon SHALL use an appropriate field-related icon (MapPin or similar)
4. WHEN I access the Fields page THEN it SHALL display all my fields with proper functionality

### Requirement 2

**User Story:** As a farmer, I want all Market-related routes and pages completely removed, so that there is no confusion or duplicate functionality in the app.

#### Acceptance Criteria

1. WHEN I try to access /market route THEN it SHALL redirect to a 404 or appropriate fallback page
2. WHEN the app loads THEN there SHALL be no Market page component imported or rendered
3. WHEN I navigate through the app THEN there SHALL be no references to Market routes in the routing configuration
4. WHEN I use the app THEN all Market-related navigation items SHALL be removed from menus

### Requirement 3

**User Story:** As a farmer, I want all Market-related components and services cleaned up, so that the app is streamlined and focused on essential farming features.

#### Acceptance Criteria

1. WHEN the app runs THEN there SHALL be no unused Market components in the codebase
2. WHEN I use navigation menus THEN there SHALL be no Market Intelligence or Market-related menu items
3. WHEN the app loads THEN there SHALL be no Market-related services or API calls being made
4. WHEN I inspect the app THEN all Market-related imports and dependencies SHALL be removed or marked as unused

### Requirement 4

**User Story:** As a developer, I want the navigation to be clean and consistent, so that the user experience is simplified and focused on core farming functionality.

#### Acceptance Criteria

1. WHEN I review the navigation code THEN the bottom navigation SHALL contain exactly 5 items: Home, Scan, Chat, Weather, Fields
2. WHEN I check the routing configuration THEN there SHALL be no /market routes defined
3. WHEN I examine the navigation components THEN the Fields navigation SHALL be properly configured with correct icon and path
4. WHEN the app is built THEN there SHALL be no build warnings about unused Market components