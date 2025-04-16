declare module "@/lib/actions/user.action" {
  export function getUserByEmail(email: string): Promise<{
    id: string;
    name: string;
    email: string;
    credits: number;
    phone: string;
    referralCode: string;
    referralCount: number;
    createdAt: string;
  } | null>;

  export function getUserById(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    credits: number;
    phone: string;
    referralCode: string;
    referralCount: number;
    createdAt: string;
  } | null>;
}
