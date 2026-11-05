export const publicUser = (user) =>
  user
    ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        pendingEmailChange: user.pendingEmailChange,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      }
    : null;
