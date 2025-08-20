import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface VideoFile {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  target_audience?: string;
  campaign_status: 'active' | 'inactive';
  bucket_name: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_deleted: boolean;
  public_url?: string;
}

export interface CreateVideoData {
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  target_audience?: string;
  campaign_status?: 'active' | 'inactive';
}

export interface UpdateVideoData {
  name?: string;
  target_audience?: string;
  campaign_status?: 'active' | 'inactive';
}

export class VideosService {
  // Fetch all videos from storage bucket
  static async getVideos(): Promise<VideoFile[]> {
    try {
      console.log('🔍 Fetching videos from advertenties bucket...');
      
      // List all files in the advertenties bucket
      const { data: files, error } = await supabase.storage
        .from('advertenties')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('❌ Error listing files:', error);
        
        // If bucket doesn't exist, return empty array
        if (error.message.includes('does not exist') || error.message.includes('not found')) {
          console.log('📋 Advertenties bucket does not exist, returning empty array');
          return [];
        }
        
        throw error;
      }

      console.log('✅ Found files:', files?.length || 0);

      // Convert storage files to VideoFile format
      const videos: VideoFile[] = await Promise.all(
        (files || []).map(async (file) => {
          // Get public URL for the file
          const { data: urlData } = supabase.storage
            .from('advertenties')
            .getPublicUrl(file.name);

          return {
            id: file.id || file.name,
            name: file.name,
            original_name: file.name,
            file_path: file.name,
            file_size: file.metadata?.size || 0,
            mime_type: file.metadata?.mimetype || 'video/mp4',
            bucket_name: 'advertenties',
            created_at: file.created_at || new Date().toISOString(),
            updated_at: file.updated_at || new Date().toISOString(),
            campaign_status: 'active' as const,
            is_deleted: false,
            public_url: urlData.publicUrl,
            target_audience: this.getTargetAudienceFromName(file.name)
          };
        })
      );

      console.log('✅ Converted to videos:', videos.length);
      return videos;

    } catch (error) {
      console.error('❌ Error in getVideos:', error);
      // Return empty array on any error to prevent app crash
      return [];
    }
  }

  // Helper function to determine target audience based on video name
  private static getTargetAudienceFromName(videoName: string): string {
    const name = videoName.toLowerCase();
    
    if (name.includes('zakelijk')) {
      return 'Ondernemers 30-50, zakelijk, Nederland, LinkedIn';
    } else if (name.includes('jeugd')) {
      return 'Jongeren 18-25, fitness, social media, Nederland';
    } else if (name.includes('vader')) {
      return 'Vaders 30-45, gezin, fitness, Nederland';
    } else if (name.includes('het_merk') || name.includes('hetmerk')) {
      return 'Mannen 25-45, fitness, lifestyle, Nederland';
    } else {
      return 'Algemene doelgroep, fitness, Nederland';
    }
  }

  // Fetch video by ID (filename)
  static async getVideoById(id: string): Promise<VideoFile | null> {
    try {
      // Get public URL for the specific file
      const { data: urlData, error } = supabase.storage
        .from('advertenties')
        .getPublicUrl(id);

      if (error) {
        console.error('❌ Error getting video URL:', error);
        return null;
      }

      // Get file metadata
      const { data: files, error: listError } = await supabase.storage
        .from('advertenties')
        .list('', {
          limit: 1000
        });

      if (listError) {
        console.error('❌ Error listing files:', listError);
        return null;
      }

      const file = files?.find(f => f.name === id);
      if (!file) {
        console.error('❌ File not found:', id);
        return null;
      }

      return {
        id: file.id || file.name,
        name: file.name,
        original_name: file.name,
        file_path: file.name,
        file_size: file.metadata?.size || 0,
        mime_type: file.metadata?.mimetype || 'video/mp4',
        bucket_name: 'advertenties',
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        campaign_status: 'active' as const,
        is_deleted: false,
        public_url: urlData.publicUrl,
        target_audience: this.getTargetAudienceFromName(file.name)
      };

    } catch (error) {
      console.error('❌ Error in getVideoById:', error);
      return null;
    }
  }

  // Create new video (this would be called after successful upload)
  static async createVideo(videoData: CreateVideoData): Promise<VideoFile> {
    try {
      // Since we're using storage, we don't need to create a database record
      // The video is already uploaded to storage
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(videoData.file_path);

      return {
        id: videoData.file_path,
        name: videoData.name,
        original_name: videoData.original_name,
        file_path: videoData.file_path,
        file_size: videoData.file_size,
        mime_type: videoData.mime_type,
        bucket_name: 'advertenties',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        campaign_status: videoData.campaign_status || 'active',
        is_deleted: false,
        public_url: urlData.publicUrl,
        target_audience: videoData.target_audience || this.getTargetAudienceFromName(videoData.name)
      };

    } catch (error) {
      console.error('❌ Error creating video:', error);
      throw error;
    }
  }

  // Update video (this would update metadata, not the actual file)
  static async updateVideo(id: string, updateData: UpdateVideoData): Promise<VideoFile | null> {
    try {
      // For storage-based videos, we can't easily update metadata
      // So we'll just return the existing video with updated fields
      const existingVideo = await this.getVideoById(id);
      if (!existingVideo) {
        return null;
      }

      return {
        ...existingVideo,
        name: updateData.name || existingVideo.name,
        target_audience: updateData.target_audience || existingVideo.target_audience,
        campaign_status: updateData.campaign_status || existingVideo.campaign_status,
        updated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error updating video:', error);
      return null;
    }
  }

  // Delete video (this would delete from storage)
  static async deleteVideo(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('advertenties')
        .remove([id]);

      if (error) {
        console.error('❌ Error deleting video:', error);
        return false;
      }

      console.log('✅ Video deleted successfully:', id);
      return true;

    } catch (error) {
      console.error('❌ Error in deleteVideo:', error);
      return false;
    }
  }

  // Get video URL
  static async getVideoUrl(filePath: string): Promise<string | null> {
    try {
      const { data, error } = supabase.storage
        .from('advertenties')
        .getPublicUrl(filePath);

      if (error) {
        console.error('❌ Error getting video URL:', error);
        return null;
      }

      return data.publicUrl;

    } catch (error) {
      console.error('❌ Error in getVideoUrl:', error);
      return null;
    }
  }
}
