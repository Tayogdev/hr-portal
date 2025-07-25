# Page Ownership Implementation

This document explains the implementation of page ownership checks for events and opportunities in the HR Portal.

## Overview

The system now ensures that only page owners can edit and delete events and opportunities. This is implemented through:

1. **Database Schema**: Uses the existing `pageOwnership` table to track ownership relationships
2. **API Endpoints**: New endpoints to check ownership status
3. **Frontend Logic**: Conditional rendering of edit/delete buttons based on ownership

## Database Schema

The implementation uses the existing database schema:

### Pages Table
```sql
- id (text)
- title (text)
- uName (text)
- type (USER-DEFINED)
- description (text)
- location (text)
- creatorName (text)
- officialLink (text)
- employeeSize (character varying)
- logo (character varying)
- bannerImage (character varying)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### PageOwnership Table
```sql
- id (text)
- userId (text)
- pageId (character varying)
- role (USER-DEFINED)
- isActive (boolean)
- addedAt (timestamp)
- leftOn (timestamp)
```

### Events Table
- Events are linked to pages via the `publishedBy` field
- This field contains the `pageId` that owns the event

### Opportunities Table
- Opportunities are linked to pages via the `publishedBy` field
- This field contains the `pageId` that owns the opportunity

## API Endpoints

### Event Ownership Check
**Endpoint**: `GET /api/events/[eventId]/ownership`

**Purpose**: Check if the current user is the page owner for a specific event

**Response**:
```json
{
  "success": true,
  "message": "Ownership check completed",
  "data": {
    "isOwner": true,
    "eventId": "event-id",
    "ownershipData": {
      "eventId": "event-id",
      "pageId": "page-id",
      "userId": "user-id",
      "role": "OWNER",
      "isActive": true
    }
  }
}
```

### Opportunity Ownership Check
**Endpoint**: `GET /api/opportunities/[opportunityId]/ownership`

**Purpose**: Check if the current user is the page owner for a specific opportunity

**Response**:
```json
{
  "success": true,
  "message": "Ownership check completed",
  "data": {
    "isOwner": true,
    "opportunityId": "opportunity-id",
    "ownershipData": {
      "opportunityId": "opportunity-id",
      "pageId": "page-id",
      "userId": "user-id",
      "role": "OWNER",
      "isActive": true
    }
  }
}
```

## Frontend Implementation

### Event Detail Page (`/events/[eventName]`)

**File**: `src/app/(protected)/events/[eventName]/page.tsx`

**Changes**:
1. Added `isPageOwner` state variable
2. Added ownership check useEffect
3. Conditionally render dropdown menu based on ownership

**Key Code**:
```typescript
const [isPageOwner, setIsPageOwner] = useState(false);

// Check page ownership for this event
useEffect(() => {
  const checkPageOwnership = async () => {
    if (!eventId) return;
    
    try {
      const ownershipResponse = await fetch(`/api/events/${eventId}/ownership`);
      const ownershipData = await ownershipResponse.json();
      
      if (ownershipData.success) {
        setIsPageOwner(ownershipData.data.isOwner);
      } else {
        setIsPageOwner(false);
      }
    } catch (err) {
      console.error('Error checking page ownership:', err);
      setIsPageOwner(false);
    }
  };

  checkPageOwnership();
}, [eventId]);

// Conditional rendering
{isPageOwner && (
  <div className="relative" ref={menuRef}>
    {/* Edit/Delete dropdown menu */}
  </div>
)}
```

### Job Detail Page (`/job-listing/[jobId]`)

**File**: `src/app/(protected)/job-listing/[jobId]/page.tsx`

**Changes**:
1. Added `isPageOwner` state variable
2. Added ownership check useEffect
3. Conditionally render dropdown menu based on ownership

**Key Code**:
```typescript
const [isPageOwner, setIsPageOwner] = useState(false);

// Check page ownership for this opportunity
useEffect(() => {
  const checkPageOwnership = async () => {
    if (!jobId) return;
    
    try {
      const ownershipResponse = await fetch(`/api/opportunities/${jobId}/ownership`);
      const ownershipData = await ownershipResponse.json();
      
      if (ownershipData.success) {
        setIsPageOwner(ownershipData.data.isOwner);
      } else {
        setIsPageOwner(false);
      }
    } catch (err) {
      console.error('Error checking page ownership:', err);
      setIsPageOwner(false);
    }
  };

  checkPageOwnership();
}, [jobId]);

// Conditional rendering
{isPageOwner && (
  <div className="relative" ref={menuRef}>
    {/* Edit/Delete dropdown menu */}
  </div>
)}
```

## Security Features

1. **Authentication Required**: All ownership check endpoints require valid authentication
2. **Rate Limiting**: API endpoints are protected by rate limiting
3. **Database Validation**: Ownership is verified through database queries
4. **Active Status Check**: Only active ownership relationships are considered
5. **Error Handling**: Graceful error handling with fallback to non-owner status

## User Experience

1. **Non-Owners**: Users who are not page owners will not see the edit/delete dropdown menu
2. **Owners**: Page owners will see the dropdown menu with edit and delete options
3. **Loading States**: Ownership checks happen in the background without blocking the UI
4. **Error Recovery**: If ownership checks fail, the system defaults to non-owner status

## Future Enhancements

1. **Edit Functionality**: Implement actual edit forms for events and opportunities
2. **Delete Functionality**: Implement actual delete operations with proper confirmation
3. **Role-Based Permissions**: Extend to support different roles (admin, editor, viewer)
4. **Audit Logging**: Track ownership changes and edit/delete operations
5. **Bulk Operations**: Support for bulk editing/deleting multiple items

## Testing

To test the implementation:

1. **As Page Owner**:
   - Navigate to an event or job you own
   - Verify the dropdown menu (three dots) is visible
   - Click the dropdown to see edit/delete options

2. **As Non-Owner**:
   - Navigate to an event or job you don't own
   - Verify the dropdown menu is not visible
   - Only the share button should be present

3. **API Testing**:
   - Test ownership check endpoints directly
   - Verify proper authentication requirements
   - Test with invalid event/opportunity IDs 