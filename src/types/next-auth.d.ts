import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      uniqueId: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    uniqueId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uniqueId: string;
    role: string;
  }
}
