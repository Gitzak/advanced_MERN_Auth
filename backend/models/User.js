import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: Date,
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiresAt: Date,
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    emailChangeToken: {
      type: String,
      select: false,
    },
    emailChangeTokenExpiresAt: Date,
    pendingEmailChange: {
      type: String,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Exclude from query results by default
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    console.log('====================================');
    console.log("9bal : " + this.password);
    console.log('====================================');
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    
    console.log("apres : " + this.password);

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to check if the user changed the password after the JWT was issued.
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedAtTimestamp;
  }

  // False means password not changed
  return false;
};

/**
 * Customize the JSON output to exclude sensitive information.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpiresAt;
  delete userObject.verificationToken;
  delete userObject.verificationTokenExpiresAt;
  delete userObject.passwordChangedAt;
  delete userObject.emailChangeToken;
  delete userObject.emailChangeTokenExpiresAt;
  delete userObject.isDeleted;
  delete userObject.deletedAt;
  delete userObject.__v;

  return userObject;
};

export const User = mongoose.model("User", userSchema);
