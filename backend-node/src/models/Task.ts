import mongoose, { Document, Schema } from 'mongoose';
import './User'; // ensure User schema is registered before populate() resolves it

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  boardId: mongoose.Types.ObjectId;
  columnId: string;
  position: number;
  assignee?: mongoose.Types.ObjectId;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: Date,
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
taskSchema.index({ boardId: 1, columnId: 1, position: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
