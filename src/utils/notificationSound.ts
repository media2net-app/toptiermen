/**
 * Utility function to play notification sound
 */

let notificationAudio: HTMLAudioElement | null = null;

/**
 * Play the notification sound for new messages
 */
export function playNotificationSound() {
  try {
    // Create audio element if it doesn't exist
    if (!notificationAudio) {
      notificationAudio = new Audio('/sounds/new-notification-05-352453.mp3');
      notificationAudio.volume = 0.5; // Set volume to 50%
    }

    // Reset the audio to start if it's already playing
    notificationAudio.currentTime = 0;
    
    // Play the sound
    notificationAudio.play().catch(err => {
      console.log('Could not play notification sound:', err);
      // This can happen if user hasn't interacted with the page yet (browser autoplay policy)
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Set the volume of notification sounds (0.0 to 1.0)
 */
export function setNotificationVolume(volume: number) {
  if (notificationAudio) {
    notificationAudio.volume = Math.max(0, Math.min(1, volume));
  }
}


