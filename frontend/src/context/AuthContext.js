import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  register: () => {},
  confirmEmail: () => {},
  resetPassword: () => {},
  resetPasswordWithToken: () => {},
  updateUser: () => {},
  requestEditEmail: () => {},
  confirmEmailChange: () => {},
  logout: () => {},
  loading: true,
});

export default AuthContext;
