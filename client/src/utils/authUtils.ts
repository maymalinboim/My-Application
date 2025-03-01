import { split, pipe, last, not } from "ramda";
import { jwtDecode } from "jwt-decode";

type DecodedJwt = {
  userId: string;
  iat: number;
  exp: number;
};

export const decodeToken = (token: string) =>
  (pipe(split("Bearer "), last, jwtDecode)(token) as DecodedJwt) || "";

export const isTokenValid = (token: string) => {
  if (token) {
    const decoded = decodeToken(token);
    const currentTime = new Date().getTime() / 1000;

    return decoded ? not(currentTime > decoded.exp) : false;
  } else {
    return false;
  }
};
