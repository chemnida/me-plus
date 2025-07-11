/**
 * Generated by MongoDB Relational Migrator
 * https://www.mongodb.com/products/relational-migrator
 * Collection: plansAddons
 * Language: JavaScript
 * Template: Mongoose
 * Generated on 2025-06-12
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

export const planAddonSchema = new Schema(
  {
    addon: {
      type: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        description: String,
      },
      required: true,
    },
    plan: { type: mongoose.ObjectId, required: true },
    benefitType: { type: String, required: true },
    addonType: String,
  },
  { collection: 'plansAddons', timestamps: true },
);

export const PlanAddon = model('PlanAddon', planAddonSchema);
