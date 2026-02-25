import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    secteurs: {
      id: string;
      nom: string;
    }[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      secteurs: {
        id: string;
        nom: string;
      }[];
    };
  }
}