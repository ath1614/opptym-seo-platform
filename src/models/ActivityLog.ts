/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema } from 'mongoose'

export interface IActivityLog extends Document {
  _id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details: {
    oldValue?: any
    newValue?: any
    metadata?: any
  }
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_verified',
      'user_plan_changed',
      'project_created',
      'project_updated',
      'project_deleted',
      'seo_tool_used',
      'submission_created',
      'submission_updated',
      'submission_deleted',
      'report_generated',
      'payment_successful',
      'payment_failed',
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'admin_action'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'project', 'seo_tool', 'submission', 'report', 'payment', 'subscription', 'system']
  },
  resourceId: {
    type: String,
    default: null
  },
  details: {
    oldValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ActivityLogSchema.index({ userId: 1, createdAt: -1 })
ActivityLogSchema.index({ action: 1, createdAt: -1 })
ActivityLogSchema.index({ resource: 1, createdAt: -1 })
ActivityLogSchema.index({ createdAt: -1 })

const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog
