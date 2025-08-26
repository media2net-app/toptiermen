-- Create admin_notifications table for task notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient TEXT NOT NULL,
    task_id UUID,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_recipient_status ON public.admin_notifications(recipient, status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin notifications are viewable by admins" ON public.admin_notifications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Admin notifications are insertable by admins" ON public.admin_notifications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Admin notifications are updatable by admins" ON public.admin_notifications
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (auth.jwt() ->> 'role')::text = 'admin'
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_notifications_updated_at 
    BEFORE UPDATE ON public.admin_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
