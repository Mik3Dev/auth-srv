import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
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

export { UserSchema };
