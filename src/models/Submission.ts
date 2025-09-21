import mongoose, { Document, Schema } from 'mongoose'

export interface ISubmission extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  linkId: mongoose.Types.ObjectId
  directory: string
  category: string
  status: 'success' | 'pending' | 'rejected' | 'failed'
  submittedAt: Date
  completedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Link'
  },
  directory: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'pending', 'rejected', 'failed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
SubmissionSchema.index({ userId: 1, projectId: 1 })
SubmissionSchema.index({ status: 1 })
SubmissionSchema.index({ submittedAt: -1 })
SubmissionSchema.index({ category: 1 })

const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission
