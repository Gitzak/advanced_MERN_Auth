import AccessControl from "accesscontrol";

const ac = new AccessControl();

// Define roles and permissions
ac.grant("Client").readOwn("profile").updateOwn("profile");

ac.grant("Employer")
  .extend("Client") // Inherit Client permissions
  .createOwn("job")
  .updateOwn("job")
  .deleteOwn("job");

ac.grant("Admin")
  .extend("Employer") // Inherit Employer permissions
  .readAny("profile")
  .updateAny("profile")
  .deleteAny("profile");
//   .createAny("job")
//   .updateAny("job")
//   .deleteAny("job");

export default ac;
