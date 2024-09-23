import mongoose, { Schema, Model } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels, AppConstant } from '../constant'

interface ShopProductAttrs {
  name: string;
  productId: string;
  brandId: string;
  shopId: string;
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
  qtyPerBox: number;
  image: string;
}


interface ShopProductModal extends Model<ShopProductDoc> {
  build(attrs: ShopProductAttrs): ShopProductDoc //build return a user that mines a refrance of ShopProductDoc so the type is ShopProductDoc
}


interface ShopProductDoc extends mongoose.Document {
  name: string;
  productId: string;
  brandId: string;
  shopId: string;
  warehouseId: string;
  userId: string | undefined;
  packing: string;
  MRP: number;
  purchasePrice: number;
  sellingPrice: number;
  qty: number;
  qtyPerBox: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const shopProductSchema = new mongoose.Schema(
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
    productId: { type: Schema.Types.ObjectId, required: true },
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
    }
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

shopProductSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const name = AppService.capitalizeFirstLetter(this.get('name'));
    this.set('name', name);
  }
  done()
})

shopProductSchema.statics.build = (attrs: ShopProductAttrs) => {
  return new ShopProduct(attrs)
}
const ShopProduct = mongoose.model<any, ShopProductModal>('shopProduct', shopProductSchema)

export { ShopProduct }
