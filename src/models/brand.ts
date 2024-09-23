import mongoose, { Schema, Types } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels, AppConstant } from '../constant'

interface BrandAttrs {
  name: string;
  userId?: Types.ObjectId;
  category: {
    _id: string;
    name: string;
  };
  packing: string;
  MRP: number;
  image: string;
  type: string;
  status: string;

}


interface BrandModal extends mongoose.Model<BrandDoc> {
  build(attrs: BrandAttrs): BrandDoc //build return a user that mines a refrance of BrandDoc so the type is BrandDoc
}


interface BrandDoc extends mongoose.Document {
  name: string;
  description?: string;
  packing: string;
  MRP: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  userId: Types.ObjectId;
  qtyPerBox: number;
  ed: number;
  aed: number;
  warranty: number;
  type: string;
  status: string;
}

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    userId: { type: Schema.Types.ObjectId, required: false },
    category: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String }
    },
    type: {
      type: String,
      enum: [
        Labels.type.global,
        Labels.type.personal
      ],
    },
    packing: {
      type: String,
      trim: true,
    },
    MRP: {
      type: Number,
      trim: true,
      required: true
    },
    qtyPerBox: {
      type: Number,
      trim: true,
      required: false
    },
    ed: {
      type: Number,
      trim: true,
      required: false
    },
    aed: {
      type: Number,
      trim: true,
      required: false
    },
    warranty: {
      type: Number,
      trim: true,
      required: false
    },
    image: {
      type: String,
      trim: true,
      default: AppConstant.BRAND_CONSTANT
    },
    status: {
      type: String,
      enum: [
        Labels.status.active,
        Labels.status.inactive,
        Labels.status.deleted
      ],
    }
  },
  {
    timestamps: true,
    // filter response
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id
      },
      versionKey: true,
    },
  },
)

brandSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const reqName = this.get('name') || "";
    const name = AppService.capitalizeFirstLetter(reqName);
    this.set('name', name);
  }
  done()
})

brandSchema.statics.build = (attrs: BrandAttrs) => {
  return new Brand(attrs)
}
const Brand = mongoose.model<any, BrandModal>('Brand', brandSchema)

export { Brand }
