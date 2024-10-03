import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  register: () => {},
  confirmEmail: () => {},
  resetPassword: () => {},
  resetPasswordWithToken: () => {},
  logout: () => {},
  loading: true,
});

export default AuthContext;
