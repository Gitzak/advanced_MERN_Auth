import ac from "../config/roles.js";

export const grantAccess = (action, resource) => {
  return (req, res, next) => {
    try {
      const permission = ac.can(req.role)[action](resource);
      if (permission.granted) {
        req.permission = permission;

        console.log('====================================');
        console.log("permission " + JSON.stringify(permission));
        console.log('====================================');

        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden - you do not have the required permissions",
        });
      }
    } catch (error) {
      console.error("Error in grantAccess middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while checking permissions",
      });
    }
  };
};
