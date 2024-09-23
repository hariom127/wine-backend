import mongoose, { Schema, Model } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels, AppConstant } from '../constant'

interface ProductAttrs {
  name: string;
  brandId: string;
  shopId: string;
  shopName: string;
  warehouseId: string;
  userId: string | undefined;
  category: {
    _id: string;
    name: string;
  };
  packing: string;
  MRP: number;
  purchasePrice: number;
  sellingPrice: number;
  qty: number,
  qtyPerBox: number
}


interface ProductModal extends Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc //build return a user that mines a refrance of ProductDoc so the type is ProductDoc
}


interface ProductDoc extends mongoose.Document {
  name: string;
  description: string;
  brandId: string;
  warehouseId: string;
  userId: string;
  shopId: string;
  category: {
    _id: string;
    name: string;
  };
  packing: string;
  MRP: number;
  purchasePrice: number;
  sellingPrice: number;
  qty: number;
  qtyPerBox: number;
  image: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    brandId: { type: Schema.Types.ObjectId, required: true },
    warehouseId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    category: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String }
    },
    packing: {
      type: String,
      trim: true,
    },
    MRP: {
      type: Number,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    qtyPerBox: {
      type: Number,
      required: true,
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
        Labels.status.inactive
      ],
      default: Labels.status.active,
    },
    createdNum: { type: Number, default: Date.now() }
  },
  {
    timestamps: true,
    // filter response
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id
      }
    },
  },
)

productSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const name = AppService.capitalizeFirstLetter(this.get('name'));
    this.set('name', name);
  }
  done()
})

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs)
}
const Product = mongoose.model<any, ProductModal>('Product', productSchema)

export { Product }
