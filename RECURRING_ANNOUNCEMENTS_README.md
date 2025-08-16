# Recurring Announcements Feature

This feature allows you to create announcements that can be automatically reused across multiple bulletins, making it easy to maintain consistent information week after week.

## What are Recurring Announcements?

Recurring announcements are announcements that you want to appear in multiple bulletins without having to retype them each time. Examples include:
- Ward temple night information
- Regular meeting schedules
- Contact information for ward leaders
- Ongoing service opportunities
- Standard ward policies

## How to Use

### 1. Create Recurring Announcements

1. **Open the Bulletin Editor**: Go to the announcements tab in your bulletin editor
2. **Click "Recurring Announcements"**: This opens the recurring announcements modal
3. **Create New**: Fill in the form on the left side:
   - **Title**: A descriptive title for the announcement
   - **Content**: The full announcement content (supports rich text)
   - **Category**: Choose from general, baptism, birthday, calling, activity, service, or other
   - **Audience**: Select who this announcement is for (ward, relief society, elders quorum, etc.)
4. **Save**: Click "Create Recurring Announcement"

### 2. Convert Existing Announcements to Recurring

1. **In the Bulletin Editor**: Go to the announcements tab
2. **Find an Announcement**: Locate an announcement you want to make recurring
3. **Click the Rotate Icon**: Use the green rotate icon (🔄) next to the announcement
4. **Confirm**: The announcement will be converted to a recurring one

### 3. Add Recurring Announcements to Bulletins

#### Option A: Add to Current Bulletin
1. **Click "Add Recurring"**: Use the green button in the toolbar
2. **Automatic Addition**: All active recurring announcements will be added to your current bulletin
3. **Review**: Check that the announcements were added correctly

#### Option B: Select Specific Announcements
1. **Open Recurring Announcements Modal**: Click the "Recurring Announcements" button
2. **Browse List**: View all your recurring announcements on the right side
3. **Add Individual**: Click the blue plus icon (+) to add a specific announcement
4. **Copy**: Use the green copy icon (📋) to duplicate an announcement

### 4. Manage Recurring Announcements

1. **Edit**: Click the edit icon (✏️) to modify an existing recurring announcement
2. **Delete**: Click the trash icon (🗑️) to remove a recurring announcement
3. **Organize**: Use categories and audiences to keep your recurring announcements organized

## Database Schema

The feature uses two new database tables:

### `recurring_announcements`
- Stores the master list of recurring announcements
- Each announcement is tied to a specific ward profile
- Supports soft deletion (marking as inactive)

### Updated `announcement_submissions`
- Added `is_recurring` and `recurrence_pattern` fields
- Allows submissions to be marked as recurring

## Technical Implementation

### Components
- **RecurringAnnouncementsModal**: Main interface for managing recurring announcements
- **BulletinForm**: Enhanced with recurring announcements button and convert functionality
- **EditorApp**: Added "Add Recurring" button to populate current bulletin

### Services
- **recurringAnnouncementsService**: Handles all database operations for recurring announcements
- **bulletinService**: Enhanced to support recurring announcement integration

### Key Functions
- `populateWithRecurringAnnouncements()`: Automatically adds recurring announcements to a bulletin
- `convertToRecurring()`: Converts existing announcements to recurring ones
- `getAnnouncementsForNewBulletin()`: Retrieves announcements that should be added to new bulletins

## Best Practices

### Creating Recurring Announcements
1. **Keep Content Generic**: Avoid specific dates or times that change weekly
2. **Use Clear Titles**: Make it easy to identify what each announcement is for
3. **Organize by Category**: Use categories to group similar announcements
4. **Set Appropriate Audience**: Target the right group for each announcement

### Managing Your Library
1. **Regular Review**: Periodically review and update recurring announcements
2. **Archive Old**: Remove or deactivate announcements that are no longer relevant
3. **Consolidate Similar**: Combine similar announcements to avoid duplication
4. **Test Content**: Make sure announcements work well in different bulletin contexts

### Workflow Tips
1. **Start with Templates**: Create recurring announcements for standard weekly information
2. **Batch Operations**: Use "Add Recurring" to quickly populate new bulletins
3. **Customize as Needed**: Modify recurring announcements in individual bulletins when needed
4. **Backup Important**: Keep copies of important recurring announcements

## Migration Notes

To use this feature, you'll need to run the database migration:

```sql
-- Run the migration file: 20250715005000_add_recurring_announcements.sql
```

This will:
- Add recurring fields to existing announcement_submissions table
- Create the new recurring_announcements table
- Set up proper Row Level Security (RLS) policies

## Troubleshooting

### Common Issues

1. **Recurring Announcements Not Appearing**
   - Check that you have a valid profile_slug
   - Verify the announcements are marked as active
   - Ensure you're logged in with the correct account

2. **Convert Button Not Working**
   - Make sure you have the latest version of the code
   - Check browser console for error messages
   - Verify database connection

3. **Modal Not Opening**
   - Check that all required components are imported
   - Verify the modal state is properly managed
   - Check for JavaScript errors in the console

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your database connection and permissions
3. Ensure all migrations have been run
4. Check that you're using the latest version of the application

## Future Enhancements

Potential improvements for future versions:
- **Scheduling**: Set specific dates when recurring announcements should appear
- **Templates**: Create bulletin templates with recurring announcements pre-loaded
- **Analytics**: Track which recurring announcements are used most often
- **Sharing**: Share recurring announcements between ward leaders
- **Versioning**: Track changes to recurring announcements over time 