import jwt from "jsonwebtoken";
import { TokenPayload } from "../../shared/models/auth/token-payload.model";

class TokenService {

  private static secret = process.env.JWT_SECRET as string;

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: "9h"
    });
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }

}

export default TokenService;