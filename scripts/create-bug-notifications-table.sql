-- Create bug_notifications table for notifying users when their bug reports are resolved
-- Execute this in Supabase Dashboard > SQL Editor

-- Create bug_notifications table
CREATE TABLE IF NOT EXISTS bug_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bug_report_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('status_update', 'resolved', 'closed', 'comment')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bug_notifications_user_id ON bug_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_notifications_is_read ON bug_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_bug_notifications_created_at ON bug_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_notifications_bug_report_id ON bug_notifications(bug_report_id);

-- Enable RLS (Row Level Security)
ALTER TABLE bug_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own bug notifications" ON bug_notifications;
DROP POLICY IF EXISTS "Service role can manage all bug notifications" ON bug_notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view their own bug notifications" ON bug_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all notifications (for sending notifications)
CREATE POLICY "Service role can manage all bug notifications" ON bug_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_bug_notifications_updated_at ON bug_notifications;
CREATE TRIGGER update_bug_notifications_updated_at
  BEFORE UPDATE ON bug_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to send bug notification
CREATE OR REPLACE FUNCTION send_bug_notification(
  p_user_id UUID,
  p_bug_report_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(200),
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO bug_notifications (
    user_id,
    bug_report_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    p_user_id,
    p_bug_report_id,
    p_type,
    p_title,
    p_message,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_bug_notification(UUID, UUID, VARCHAR(50), VARCHAR(200), TEXT, JSONB) TO authenticated;

-- Insert sample notification for testing (optional)
-- INSERT INTO bug_notifications (user_id, bug_report_id, type, title, message) 
-- VALUES ('your-user-id-here', 'your-bug-report-id-here', 'status_update', 'Bug Status Bijgewerkt', 'Je bug melding is bijgewerkt naar "In Progress"');

COMMENT ON TABLE bug_notifications IS 'Notifications for bug report updates and status changes';
COMMENT ON COLUMN bug_notifications.type IS 'Type of notification: status_update, resolved, closed, comment';
COMMENT ON COLUMN bug_notifications.metadata IS 'Additional data like old_status, new_status, admin_notes, etc.';
