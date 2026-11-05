import { User } from "../models/User.js";
export const activeUser = { isDeleted: { $ne: true } };
export const findUserByEmail = (email) =>
  User.findOne({ email, ...activeUser }).select("+password +sessionVersion");
export const findUserById = (id) =>
  User.findOne({ _id: id, ...activeUser }).select("+sessionVersion");
export const findUserByIdWithPassword = (id) =>
  User.findOne({ _id: id, ...activeUser }).select("+password +sessionVersion");
export const checkEmailExists = (email) =>
  User.exists({ email, ...activeUser });
