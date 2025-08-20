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
  // Fetch all videos
  static async getVideos(): Promise<VideoFile[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }

    return data || [];
  }

  // Fetch video by ID
  static async getVideoById(id: string): Promise<VideoFile | null> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('Error fetching video:', error);
      return null;
    }

    return data;
  }

  // Create new video
  static async createVideo(videoData: CreateVideoData): Promise<VideoFile> {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      throw error;
    }

    return data;
  }

  // Update video
  static async updateVideo(id: string, updates: UpdateVideoData): Promise<VideoFile> {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      throw error;
    }

    return data;
  }

  // Update video name
  static async updateVideoName(id: string, name: string): Promise<VideoFile> {
    return this.updateVideo(id, { name });
  }

  // Update target audience
  static async updateTargetAudience(id: string, targetAudience: string): Promise<VideoFile> {
    return this.updateVideo(id, { target_audience: targetAudience });
  }

  // Toggle campaign status
  static async toggleCampaignStatus(id: string): Promise<VideoFile> {
    const video = await this.getVideoById(id);
    if (!video) {
      throw new Error('Video not found');
    }

    const newStatus = video.campaign_status === 'active' ? 'inactive' : 'active';
    return this.updateVideo(id, { campaign_status: newStatus });
  }

  // Soft delete video
  static async deleteVideo(id: string): Promise<void> {
    const { error } = await supabase
      .from('videos')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Get video URL
  static getVideoUrl(video: VideoFile): string {
    // For now, return the local path since we're using local files
    return video.file_path;
  }

  // Get videos by campaign status
  static async getVideosByStatus(status: 'active' | 'inactive'): Promise<VideoFile[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('campaign_status', status)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos by status:', error);
      throw error;
    }

    return data || [];
  }

  // Search videos by name
  static async searchVideos(query: string): Promise<VideoFile[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching videos:', error);
      throw error;
    }

    return data || [];
  }
}
