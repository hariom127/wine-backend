import mongoose, { Schema, Model, Types } from 'mongoose'
import { Labels } from '../constant'

interface BalanceSheetAttrs {
  userId: Types.ObjectId;
  note: string;
  entityId?: Types.ObjectId;
  entityType?: string;
  qty?: number;
  qtyPerBox?: number;
  amount: number;
  balance: number;
  tag: string;
  transactionType: string;
  date: Date;
}


interface BalanceSheetModal extends Model<BalanceSheetDoc> {
  build(attrs: BalanceSheetAttrs): BalanceSheetDoc //build return a user that mines a refrance of BalanceSheetDoc so the type is BalanceSheetDoc
}


interface BalanceSheetDoc extends mongoose.Document {
  note: string;
  entityId?: string;
  entityType?: string;
  qty: number;
  qtyPerBox: number;
  amount: number;
  balance: number;
  tag: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const balanceSheetSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      trim: true,
      required: true
    },
    userId: { type: Schema.Types.ObjectId, required: true },
    entityId: { type: Schema.Types.ObjectId, required: false }, // Id of document which belongs to this
    entityType: { type: String, required: false }, // collection name which refer to this document
    qty: {
      type: Number,
      required: false,
    },
    qtyPerBox: {
      type: Number,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: { // account balance after this entry
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        Labels.transactionType.credit,
        Labels.transactionType.debit,
      ],
      required: true
    },
    tag: {
      type: String,
      enum: [
        Labels.tag.cash,
        Labels.tag.purchase,
        Labels.tag.sale,
        Labels.tag.salary,
        Labels.tag.rent,
        Labels.tag.fuel,
        Labels.tag.officeExpense,
        Labels.tag.return,
        Labels.tag.other,
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        Labels.status.active,
        Labels.status.inactive
      ],
      default: Labels.status.active,
    },
    dateNum: { type: Number, default: Date.now },
    date: { type: Date }
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

balanceSheetSchema.statics.build = (attrs: BalanceSheetAttrs) => {
  return new BalanceSheet(attrs)
}
const BalanceSheet = mongoose.model<any, BalanceSheetModal>('balanceSheet', balanceSheetSchema)

export { BalanceSheet }
