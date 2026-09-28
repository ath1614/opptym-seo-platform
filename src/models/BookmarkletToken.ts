import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IBookmarkletToken extends Document {
  userId: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  linkId: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  usageCount: number
  maxUsage: number
  createdAt: Date
}

const BookmarkletTokenSchema = new Schema<IBookmarkletToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '24h' } // Automatically delete expired tokens
    },
    usageCount: {
      type: Number,
      default: 0
    },
    maxUsage: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
)

const BookmarkletToken: Model<IBookmarkletToken> = mongoose.models.BookmarkletToken || mongoose.model('BookmarkletToken', BookmarkletTokenSchema)

export default BookmarkletToken
