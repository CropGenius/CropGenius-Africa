# Design Document

## Overview

This design outlines the complete removal of the satellite imagery section from the CropGenius homescreen. The satellite imagery section is currently implemented as a large card component that displays real-time satellite monitoring with NDVI health data, field size, and crop type information. The removal will simplify the interface and improve page load performance by eliminating the SatelliteImageryDisplay component.

## Architecture

The satellite imagery section removal involves modifying the Index.tsx component in the pages directory. The current architecture shows:

- **Index.tsx**: Main homescreen component that renders the satellite imagery section conditionally based on field availability
- **SatelliteImageryDisplay**: Component that handles satellite imagery rendering (will be removed from this page)
- **Dashboard Manager**: Provides field data that feeds into the satellite display

The removal will maintain the existing component architecture while simply eliminating the satellite imagery rendering block.

## Components and Interfaces

### Modified Components

**Index.tsx**
- Remove the entire satellite imagery section (lines containing the satellite intelligence card)
- Remove the SatelliteImageryDisplay import if not used elsewhere
- Maintain all other existing functionality (My Fields, Daily Organic Action Card, header)
- Preserve the conditional rendering logic for fields but remove satellite-specific rendering

### Unchanged Components

**DailyOrganicActionCard**: Remains fully functional
**My Fields Card**: Continues to display field grid as before
**Dashboard Manager Hook**: No changes needed - still provides field data for other components

## Data Models

No data model changes are required. The existing field data structure remains intact:

```typescript
interface Field {
  id: string;
  name: string;
  size_hectares: number;
  crop_type: string;
  boundary?: {
    coordinates: any;
  };
}
```

The field data will continue to be used by the "My Fields" section but will no longer feed into satellite imagery display.

## Error Handling

### Import Cleanup
- Safely remove SatelliteImageryDisplay import
- Ensure no other components in the project depend on this import from Index.tsx

### Layout Stability
- Verify that removing the satellite section doesn't break the CSS grid/flexbox layout
- Ensure proper spacing is maintained between remaining components

### Conditional Logic
- Remove the conditional check `{dashboard.fields && dashboard.fields.length > 0 && (` that wraps the satellite section
- Maintain other field-based conditional rendering for the "My Fields" section

## Testing Strategy

### Visual Testing
- Verify homescreen renders correctly without satellite imagery
- Test responsive behavior on mobile devices
- Confirm proper spacing between remaining components

### Functional Testing
- Ensure "My Fields" section continues to work properly
- Verify Daily Organic Action Card functionality is unaffected
- Test field navigation from "My Fields" grid still works

### Code Quality Testing
- Confirm no unused imports remain
- Verify no console errors are introduced
- Check that TypeScript compilation succeeds without warnings