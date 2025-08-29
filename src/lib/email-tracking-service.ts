import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface EmailTrackingData {
  campaign_id?: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  template_type: string;
}

export interface EmailAnalytics {
  campaign_id: string;
  campaign_name: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  created_at: string;
  sent_at?: string;
  completed_at?: string;
}

export class EmailTrackingService {
  /**
   * Create a new email campaign
   */
  static async createCampaign(name: string, subject: string, template_type: string = 'marketing') {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name,
          subject,
          template_type,
          status: 'draft',
          total_recipients: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }

  /**
   * Create tracking record for an email
   */
  static async createTrackingRecord(trackingData: EmailTrackingData) {
    try {
      // Generate unique tracking ID
      const tracking_id = `ttm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('email_tracking')
        .insert({
          ...trackingData,
          tracking_id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tracking record:', error);
      throw error;
    }
  }

  /**
   * Mark email as sent
   */
  static async markAsSent(tracking_id: string) {
    try {
      const { data, error } = await supabase
        .from('email_tracking')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', tracking_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking email as sent:', error);
      throw error;
    }
  }

  /**
   * Mark email as delivered
   */
  static async markAsDelivered(tracking_id: string) {
    try {
      const { data, error } = await supabase
        .from('email_tracking')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', tracking_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking email as delivered:', error);
      throw error;
    }
  }

  /**
   * Track email open
   */
  static async trackOpen(tracking_id: string, user_agent?: string, ip_address?: string) {
    try {
      // First, get the actual UUID from the tracking_id string
      const { data: trackingRecord, error: fetchError } = await supabase
        .from('email_tracking')
        .select('id')
        .eq('tracking_id', tracking_id)
        .single();

      if (fetchError) {
        console.error('Error fetching tracking record:', fetchError);
        throw fetchError;
      }

      // Call the database function to track open
      const { error } = await supabase.rpc('track_email_open', {
        tracking_id_param: tracking_id
      });

      if (error) throw error;

      // Insert detailed open record
      const { data, error: insertError } = await supabase
        .from('email_opens')
        .insert({
          tracking_id: trackingRecord.id, // Use the UUID here
          opened_at: new Date().toISOString(),
          user_agent,
          ip_address
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (error) {
      console.error('Error tracking email open:', error);
      throw error;
    }
  }

  /**
   * Track email click
   */
  static async trackClick(tracking_id: string, link_url: string, link_text?: string, user_agent?: string, ip_address?: string) {
    try {
      // First, get the actual UUID from the tracking_id string
      const { data: trackingRecord, error: fetchError } = await supabase
        .from('email_tracking')
        .select('id')
        .eq('tracking_id', tracking_id)
        .single();

      if (fetchError) {
        console.error('Error fetching tracking record:', fetchError);
        throw fetchError;
      }

      // Call the database function to track click
      const { error } = await supabase.rpc('track_email_click', {
        tracking_id_param: tracking_id,
        link_url_param: link_url,
        link_text_param: link_text || ''
      });

      if (error) throw error;

      // Insert detailed click record
      const { data, error: insertError } = await supabase
        .from('email_clicks')
        .insert({
          tracking_id: trackingRecord.id, // Use the UUID here
          link_url,
          link_text,
          clicked_at: new Date().toISOString(),
          user_agent,
          ip_address
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (error) {
      console.error('Error tracking email click:', error);
      throw error;
    }
  }

  /**
   * Track email bounce
   */
  static async trackBounce(tracking_id: string, bounce_type: 'hard' | 'soft' | 'blocked', bounce_reason?: string, smtp_response?: string) {
    try {
      const { data, error } = await supabase
        .from('email_bounces')
        .insert({
          tracking_id,
          bounce_type,
          bounce_reason,
          smtp_response,
          bounced_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update main tracking record
      await supabase
        .from('email_tracking')
        .update({
          status: 'bounced',
          bounced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', tracking_id);

      return data;
    } catch (error) {
      console.error('Error tracking email bounce:', error);
      throw error;
    }
  }

  /**
   * Track unsubscribe
   */
  static async trackUnsubscribe(tracking_id: string, reason?: string, ip_address?: string, user_agent?: string) {
    try {
      const { data, error } = await supabase
        .from('email_unsubscribes')
        .insert({
          tracking_id,
          reason,
          ip_address,
          user_agent,
          unsubscribed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update main tracking record
      await supabase
        .from('email_tracking')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', tracking_id);

      return data;
    } catch (error) {
      console.error('Error tracking unsubscribe:', error);
      throw error;
    }
  }

  /**
   * Get email analytics for all campaigns
   */
  static async getEmailAnalytics(): Promise<EmailAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('email_analytics_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting email analytics:', error);
      throw error;
    }
  }

  /**
   * Get detailed tracking for a specific campaign
   */
  static async getCampaignTracking(campaign_id: string) {
    try {
      const { data, error } = await supabase
        .from('email_tracking')
        .select(`
          *,
          email_opens (*),
          email_clicks (*),
          email_bounces (*),
          email_unsubscribes (*)
        `)
        .eq('campaign_id', campaign_id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting campaign tracking:', error);
      throw error;
    }
  }

  /**
   * Get daily analytics summary
   */
  static async getDailyAnalytics(campaign_id?: string, days: number = 30) {
    try {
      let query = supabase
        .from('email_analytics_summary')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (campaign_id) {
        query = query.eq('campaign_id', campaign_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting daily analytics:', error);
      throw error;
    }
  }

  /**
   * Update campaign statistics
   */
  static async updateCampaignStats(campaign_id: string) {
    try {
      // Get current stats from tracking table
      const { data: trackingData, error: trackingError } = await supabase
        .from('email_tracking')
        .select('status')
        .eq('campaign_id', campaign_id);

      if (trackingError) throw trackingError;

      const stats = {
        sent_count: trackingData.filter(t => ['sent', 'delivered', 'opened', 'clicked'].includes(t.status)).length,
        open_count: trackingData.filter(t => ['opened', 'clicked'].includes(t.status)).length,
        click_count: trackingData.filter(t => t.status === 'clicked').length,
        bounce_count: trackingData.filter(t => t.status === 'bounced').length,
        unsubscribe_count: trackingData.filter(t => t.status === 'unsubscribed').length
      };

      // Update campaign
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          ...stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating campaign stats:', error);
      throw error;
    }
  }

  /**
   * Generate tracking pixel HTML
   */
  static generateTrackingPixel(tracking_id: string): string {
    const pixelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/track-open?tid=${tracking_id}`;
    return `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
  }

  /**
   * Generate tracking link
   */
  static generateTrackingLink(originalUrl: string, tracking_id: string, link_text?: string): string {
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/track-click?tid=${tracking_id}&url=${encodeURIComponent(originalUrl)}&text=${encodeURIComponent(link_text || '')}`;
    return trackingUrl;
  }

  /**
   * Add tracking to email HTML
   */
  static addTrackingToEmail(html: string, tracking_id: string): string {
    // Add tracking pixel
    const trackingPixel = this.generateTrackingPixel(tracking_id);
    
    // Add tracking pixel before closing body tag
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${trackingPixel}\n</body>`);
    } else {
      html += trackingPixel;
    }

    // Replace all links with tracking links
    const linkRegex = /<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/gi;
    html = html.replace(linkRegex, (match, url, attributes, text) => {
      // Skip tracking links and unsubscribe links
      if (url.includes('/api/email/track-') || url.includes('unsubscribe')) {
        return match;
      }
      
      const trackingUrl = this.generateTrackingLink(url, tracking_id, text);
      return `<a href="${trackingUrl}"${attributes}>${text}</a>`;
    });

    return html;
  }
}
