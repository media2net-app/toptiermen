/**
 * Video Upload Performance Logger
 * Tracks detailed timing for video upload and processing steps
 */

export interface VideoUploadLog {
  id: string;
  fileName: string;
  fileSize: number;
  startTime: number;
  steps: VideoUploadStep[];
  totalDuration: number;
  success: boolean;
  error?: string;
}

export interface VideoUploadStep {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  details?: any;
}

class VideoUploadLogger {
  private logs: VideoUploadLog[] = [];
  private currentLog: VideoUploadLog | null = null;

  /**
   * Start a new video upload session
   */
  startUpload(file: File): string {
    const logId = `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    this.currentLog = {
      id: logId,
      fileName: file.name,
      fileSize: file.size,
      startTime: Date.now(),
      steps: [],
      totalDuration: 0,
      success: false
    };

    this.logStep('Upload Session Started', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      logId
    });

    console.log('📊 ===== VIDEO UPLOAD LOGGING STARTED =====');
    console.log('📋 File:', {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type
    });
    console.log('🆔 Log ID:', logId);

    return logId;
  }

  /**
   * Log a step in the upload process
   */
  logStep(stepName: string, details?: any): void {
    if (!this.currentLog) {
      console.warn('⚠️ No active upload session');
      return;
    }

    const step: VideoUploadStep = {
      name: stepName,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      details
    };

    // If there's a previous step, set its end time
    if (this.currentLog.steps.length > 0) {
      const previousStep = this.currentLog.steps[this.currentLog.steps.length - 1];
      previousStep.endTime = step.startTime;
      previousStep.duration = previousStep.endTime - previousStep.startTime;
    }

    this.currentLog.steps.push(step);

    console.log(`⏱️ [${stepName}] Started at ${new Date(step.startTime).toISOString()}`);
    if (details) {
      console.log(`📋 Details:`, details);
    }
  }

  /**
   * Complete the current step
   */
  completeStep(stepName: string, details?: any): void {
    if (!this.currentLog) {
      console.warn('⚠️ No active upload session');
      return;
    }

    const step = this.currentLog.steps.find(s => s.name === stepName);
    if (step) {
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;
      if (details) {
        step.details = details;
      }

      console.log(`✅ [${stepName}] Completed in ${step.duration}ms`);
      if (details) {
        console.log(`📋 Final details:`, details);
      }
    }
  }

  /**
   * Complete the upload session
   */
  completeUpload(success: boolean, error?: string): VideoUploadLog | null {
    if (!this.currentLog) {
      console.warn('⚠️ No active upload session');
      return null;
    }

    // Complete the last step
    if (this.currentLog.steps.length > 0) {
      const lastStep = this.currentLog.steps[this.currentLog.steps.length - 1];
      lastStep.endTime = Date.now();
      lastStep.duration = lastStep.endTime - lastStep.startTime;
    }

    this.currentLog.totalDuration = Date.now() - this.currentLog.startTime;
    this.currentLog.success = success;
    if (error) {
      this.currentLog.error = error;
    }

    // Add to logs array
    this.logs.push(this.currentLog);

    // Print summary
    this.printSummary(this.currentLog);

    const completedLog = this.currentLog;
    this.currentLog = null;

    return completedLog;
  }

  /**
   * Print detailed summary of the upload
   */
  private printSummary(log: VideoUploadLog): void {
    console.log('📊 ===== VIDEO UPLOAD SUMMARY =====');
    console.log('🆔 Log ID:', log.id);
    console.log('📁 File:', log.fileName);
    console.log('📏 Size:', (log.fileSize / (1024 * 1024)).toFixed(2) + ' MB');
    console.log('⏱️ Total Duration:', log.totalDuration + 'ms');
    console.log('✅ Success:', log.success);
    
    if (log.error) {
      console.log('❌ Error:', log.error);
    }

    console.log('\n📋 Step Breakdown:');
    log.steps.forEach((step, index) => {
      const percentage = ((step.duration / log.totalDuration) * 100).toFixed(1);
      console.log(`  ${index + 1}. ${step.name}: ${step.duration}ms (${percentage}%)`);
      if (step.details) {
        console.log(`     Details:`, step.details);
      }
    });

    // Performance analysis
    this.analyzePerformance(log);
  }

  /**
   * Analyze performance and provide recommendations
   */
  private analyzePerformance(log: VideoUploadLog): void {
    console.log('\n🔍 Performance Analysis:');
    
    const uploadSteps = log.steps.filter(s => s.name.includes('Upload'));
    const processingSteps = log.steps.filter(s => s.name.includes('Processing') || s.name.includes('Verwerken'));
    
    if (uploadSteps.length > 0) {
      const uploadTime = uploadSteps.reduce((sum, step) => sum + step.duration, 0);
      console.log(`📤 Upload time: ${uploadTime}ms`);
    }
    
    if (processingSteps.length > 0) {
      const processingTime = processingSteps.reduce((sum, step) => sum + step.duration, 0);
      console.log(`⚙️ Processing time: ${processingTime}ms`);
      
      if (processingTime > 1000) {
        console.log('⚠️ Processing time is high (>1s) - consider optimization');
      }
    }

    // Find slowest step
    const slowestStep = log.steps.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    
    if (slowestStep.duration > 500) {
      console.log(`🐌 Slowest step: ${slowestStep.name} (${slowestStep.duration}ms)`);
    }

    console.log('📊 ===== END SUMMARY =====\n');
  }

  /**
   * Get all logs
   */
  getLogs(): VideoUploadLog[] {
    return this.logs;
  }

  /**
   * Get logs for a specific file
   */
  getLogsForFile(fileName: string): VideoUploadLog[] {
    return this.logs.filter(log => log.fileName === fileName);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalUploads: number;
    averageDuration: number;
    successRate: number;
    averageFileSize: number;
  } {
    if (this.logs.length === 0) {
      return {
        totalUploads: 0,
        averageDuration: 0,
        successRate: 0,
        averageFileSize: 0
      };
    }

    const successfulUploads = this.logs.filter(log => log.success);
    const totalDuration = this.logs.reduce((sum, log) => sum + log.totalDuration, 0);
    const totalFileSize = this.logs.reduce((sum, log) => sum + log.fileSize, 0);

    return {
      totalUploads: this.logs.length,
      averageDuration: totalDuration / this.logs.length,
      successRate: (successfulUploads.length / this.logs.length) * 100,
      averageFileSize: totalFileSize / this.logs.length
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('🧹 Video upload logs cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const videoUploadLogger = new VideoUploadLogger();

// Convenience functions
export const startVideoUploadLog = (file: File) => videoUploadLogger.startUpload(file);
export const logVideoUploadStep = (stepName: string, details?: any) => videoUploadLogger.logStep(stepName, details);
export const completeVideoUploadStep = (stepName: string, details?: any) => videoUploadLogger.completeStep(stepName, details);
export const completeVideoUpload = (success: boolean, error?: string) => videoUploadLogger.completeUpload(success, error);
export const getVideoUploadLogs = () => videoUploadLogger.getLogs();
export const getVideoUploadStats = () => videoUploadLogger.getPerformanceStats(); 