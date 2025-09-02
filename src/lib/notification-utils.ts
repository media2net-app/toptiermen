import { supabaseAdmin } from '@/lib/supabase-admin';

// Function to send notification when a new bug report is created
export async function sendNewBugNotification(bugReport: any) {
  try {
    console.log('🔔 Sending new bug notification for:', bugReport.id);

    // Create notification for the user who created the bug report
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('bug_notifications')
      .insert([{
        user_id: bugReport.test_user_id,
        bug_report_id: bugReport.id,
        type: 'new_bug',
        title: 'Nieuwe Bug Melding Aangemaakt',
        message: `Je bug melding "${bugReport.description.substring(0, 100)}${bugReport.description.length > 100 ? '...' : ''}" is succesvol aangemaakt en wordt door ons team bekeken.`,
        metadata: {
          type: bugReport.type,
          priority: bugReport.priority,
          page_url: bugReport.page_url,
          created_at: bugReport.created_at
        },
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (notificationError) {
      console.error('❌ Error creating new bug notification:', notificationError);
      return false;
    }

    console.log('✅ New bug notification created:', notification.id);
    return true;

  } catch (error) {
    console.error('❌ Error sending new bug notification:', error);
    return false;
  }
}

// Function to send notification when bug status changes
export async function sendBugStatusChangeNotification(
  userId: string,
  bugReportId: string,
  oldStatus: string,
  newStatus: string,
  description: string,
  metadata: any = {}
) {
  try {
    console.log('🔔 Sending bug status change notification:', { userId, bugReportId, oldStatus, newStatus });

    const getStatusChangeTitle = (oldStatus: string, newStatus: string) => {
      switch (newStatus) {
        case 'in_progress':
          return 'Bug Melding In Behandeling';
        case 'resolved':
          return 'Bug Melding Opgelost! 🎉';
        case 'closed':
          return 'Bug Melding Afgesloten';
        case 'open':
          return 'Bug Melding Heropend';
        default:
          return 'Bug Melding Status Bijgewerkt';
      }
    };

    const getStatusChangeMessage = (oldStatus: string, newStatus: string, description: string) => {
      const shortDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;
      
      switch (newStatus) {
        case 'in_progress':
          return `Je bug melding "${shortDescription}" wordt nu behandeld door ons team. We houden je op de hoogte van de voortgang.`;
        case 'resolved':
          return `Geweldig nieuws! Je bug melding "${shortDescription}" is opgelost. Bedankt voor je melding en geduld.`;
        case 'closed':
          return `Je bug melding "${shortDescription}" is afgesloten. Als je nog vragen hebt, neem dan contact met ons op.`;
        case 'open':
          return `Je bug melding "${shortDescription}" is heropend en wordt opnieuw bekeken door ons team.`;
        default:
          return `De status van je bug melding "${shortDescription}" is bijgewerkt van "${oldStatus}" naar "${newStatus}".`;
      }
    };

    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('bug_notifications')
      .insert([{
        user_id: userId,
        bug_report_id: bugReportId,
        type: 'status_update',
        title: getStatusChangeTitle(oldStatus, newStatus),
        message: getStatusChangeMessage(oldStatus, newStatus, description),
        metadata: {
          ...metadata,
          old_status: oldStatus,
          new_status: newStatus,
          sent_at: new Date().toISOString()
        },
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (notificationError) {
      console.error('❌ Error creating status change notification:', notificationError);
      return false;
    }

    console.log('✅ Status change notification created:', notification.id);
    return true;

  } catch (error) {
    console.error('❌ Error sending status change notification:', error);
    return false;
  }
}
