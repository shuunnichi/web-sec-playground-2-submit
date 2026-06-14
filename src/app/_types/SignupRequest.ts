import { z } from "zod";
import { userNameSchema, emailSchema, passwordSchema } from "./CommonSchemas";

export const signupRequestSchema = z
  .object({
    name: userNameSchema,
    email: emailSchema,
    password: passwordSchema,
    // 👇 確認用パスワードの項目を追加
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  })
  // 👇 パスワードが一致しているかの検証ルールを追加
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"], 
  });

export type SignupRequest = z.infer<typeof signupRequestSchema>;