import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  register: () => {},
  confirmEmail: () => {},
  logout: () => {},
  loading: true,
});

export default AuthContext;
