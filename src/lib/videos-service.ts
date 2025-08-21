import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use anon key for client-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // Fetch all videos from database
  static async getVideos(): Promise<VideoFile[]> {
    try {
      console.log('🔍 Fetching videos from database...');
      
      // Get all videos from the database
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('bucket_name', 'advertenties')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching videos from database:', error);
        return [];
      }

      console.log('✅ Found videos in database:', videos?.length || 0);

      // Add public URLs to videos
      const videosWithUrls: VideoFile[] = await Promise.all(
        (videos || []).map(async (video) => {
          // Get public URL for the file
          const { data: urlData } = supabase.storage
            .from('advertenties')
            .getPublicUrl(video.original_name);

          return {
            ...video,
            public_url: urlData.publicUrl
          };
        })
      );

      console.log('✅ Videos with URLs:', videosWithUrls.length);
      return videosWithUrls;

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

  // Fetch video by ID from database
  static async getVideoById(id: string): Promise<VideoFile | null> {
    try {
      // Get video from database
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('❌ Error fetching video by ID:', error);
        return null;
      }

      if (!video) {
        console.error('❌ Video not found:', id);
        return null;
      }

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(video.original_name);

      return {
        ...video,
        public_url: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Error in getVideoById:', error);
      return null;
    }
  }

  // Create new video in database
  static async createVideo(videoData: CreateVideoData): Promise<VideoFile> {
    try {
      // Create video record in database
      const { data: video, error } = await supabase
        .from('videos')
        .insert({
          name: videoData.original_name, // Use original filename as name
          original_name: videoData.original_name,
          file_path: videoData.file_path,
          file_size: videoData.file_size,
          mime_type: videoData.mime_type,
          target_audience: videoData.target_audience || 'Algemene doelgroep, fitness, Nederland',
          campaign_status: videoData.campaign_status || 'inactive',
          bucket_name: 'advertenties',
          is_deleted: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating video in database:', error);
        throw error;
      }

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(videoData.original_name);

      return {
        ...video,
        public_url: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Error creating video:', error);
      throw error;
    }
  }

  // Update video in database
  static async updateVideo(id: string, updateData: UpdateVideoData): Promise<VideoFile | null> {
    try {
      // Update video in database
      const { data: video, error } = await supabase
        .from('videos')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('is_deleted', false)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating video:', error);
        return null;
      }

      if (!video) {
        return null;
      }

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(video.original_name);

      return {
        ...video,
        public_url: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Error updating video:', error);
      return null;
    }
  }

  // Delete video (soft delete in database)
  static async deleteVideo(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

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
      const { data } = supabase.storage
        .from('advertenties')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error('❌ Error in getVideoUrl:', error);
      return null;
    }
  }
}
