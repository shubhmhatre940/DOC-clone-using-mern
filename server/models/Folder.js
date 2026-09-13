import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [80, 'Folder name cannot exceed 80 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;
