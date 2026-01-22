import { Schema, model } from 'mongoose'

const ContadorSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
    default: 0,
  },
})

export const ContadorModel = model(
  'Contador',
  ContadorSchema
)