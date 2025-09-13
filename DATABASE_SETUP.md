# Database Setup Instructions

## Auto-Cleanup System

This project includes an enhanced database auto-cleanup system that automatically maintains database performance by removing expired and inactive sessions.

### Migration Required

Before the cleanup system can work, you need to run the database migrations in order:

1. **Navigate to Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Open the SQL Editor

2. **Run the Migrations in Order**
   - First: `supabase/migrations/20250911183251_d8ad4f4d-efe1-4740-91e5-1af5450814f9.sql` (initial schema)
   - Second: `supabase/migrations/20250911183315_bdaabe3a-6fbc-4d39-985b-06e1a4fe9eeb.sql` (security fixes)
   - Third: `supabase/migrations/20250913113230_enhanced_auto_cleanup.sql` (auto-cleanup system)
   - Copy each file's content, paste into SQL Editor, and execute in sequence

### What the Migration Includes

The migration creates several database functions and views:

#### Cleanup Functions

- `cleanup_expired_sessions()` - Removes sessions older than 6 hours
- `cleanup_inactive_sessions()` - Removes sessions inactive for 30+ minutes
- `cleanup_abandoned_sessions()` - Removes sessions abandoned for 1+ hour
- `mark_inactive_users()` - Marks users inactive after 5 minutes

#### Monitoring Functions

- `user_heartbeat(session_code, user_name)` - Updates user activity timestamp
- `session_health` view - Real-time monitoring of session statistics

#### Automatic Triggers

- Heartbeat system runs every 30 seconds from active clients
- Cleanup functions run every 5 minutes from active clients
- Session health is updated in real-time

### Features

✅ **6-Hour Session Timeout** - Sessions automatically expire after 6 hours
✅ **Activity-Based Cleanup** - Inactive sessions cleaned up based on user activity
✅ **Real-Time Monitoring** - Live dashboard at `/admin` to monitor cleanup
✅ **Automatic Heartbeats** - Client sends heartbeat every 30 seconds
✅ **Manual Cleanup** - Admin can trigger manual cleanup if needed
✅ **Session Health View** - Real-time statistics and monitoring

### Admin Dashboard

Access the database administration dashboard at:

```
https://your-app.vercel.app/admin
```

The admin dashboard shows:

- Total and active session counts
- User activity statistics
- Session status and expiration times
- Manual cleanup controls
- Real-time monitoring

### Testing the System

1. **Deploy the Migration** - Run the SQL migration first
2. **Create Test Sessions** - Create some collaborative sessions
3. **Monitor Activity** - Check the `/admin` dashboard
4. **Wait for Cleanup** - Expired sessions will be automatically cleaned up
5. **Verify Results** - Check that old sessions are removed from database

### Troubleshooting

- **Migration Errors**: Ensure you have proper database permissions
- **Cleanup Not Working**: Check that migration was applied successfully
- **Admin Page Errors**: Verify that all database functions were created

The system is designed to be completely automatic once the migration is deployed!
