import mongoose from 'mongoose'
import { AppService } from '../services/appService'
import { Labels } from '../constant'
/**
 * an interface that described the properties that are required for creating a new user
 */
interface CategoryAttrs {
  name: string;
  type: string;
  status: string;
}

/**
 * an interface that described the properties that a user modal has
 * ex. tell ts a build Function has inside CategoryModal
 * so we can use it like this => Category.build
 * using CategoryModal interface we exract all existing categorySchema property and add one additional property to it called build-function
 */
interface CategoryModal extends mongoose.Model<CategoryDoc> {
  build(attrs: CategoryAttrs): CategoryDoc //build return a user that mines a refrance of CategoryDoc so the type is CategoryDoc
}

/**
 * an interface that described the properties that a user-document(user table row) has
 */
interface CategoryDoc extends mongoose.Document {
  name: string;
  type: string;
  status: string;
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        Labels.categoryType.global,
        Labels.categoryType.personal
      ],
      trim: true,
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/931/931949.png"
    },
    status: {
      type: String,
      enum: [
        Labels.status.active,
        Labels.status.inactive
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

categorySchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const reqName = this.get('name') || "";
    const name = AppService.capitalizeFirstLetter(reqName);
    this.set('name', name);
  }
  done()
})


//build is just a custom name we can set name as we want
//schemaName.statics.FnName this is a way we can add and use a function from this model without exporting sepratly and check types as per TS likes this ==> schemaName.FnName(param:typecheck)

categorySchema.statics.build = (attrs: CategoryAttrs) => {
  return new Category(attrs)
}
const Category = mongoose.model<any, CategoryModal>('Category', categorySchema)

export { Category }
