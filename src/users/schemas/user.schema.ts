import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.clientId;
      delete ret.clientSecret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop()
  clientSecret: string;

  @Prop({ default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashPassword = await bcrypt.hash(this['password'], 10);
    this.set('password', hashPassword);
  }
  next();
});

UserSchema.statics.createClientSecret = async function (
  userId: string,
  clientSecretSize = 64,
) {
  const clientSecret = crypto.randomBytes(clientSecretSize).toString('hex');
  return this.findByIdAndUpdate(userId, { clientSecret }, { new: true });
};

export { UserSchema };

export interface IUserModel extends Model<UserDocument> {
  id?: string;
  createClientSecret: (userId: string, clientSecretSize?: number) => any;
}
