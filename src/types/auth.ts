export type IVerifyEmail = {
  email: string;
  oneTimeCode: number;
};

export type ILoginData = {
  email: string;
  password: string;
  phnNum: string;
  loginStatus?: string;
};

export type IRefreshToken = {
  refreshToken?: string;
  id: string;
  role: string;
  email: string;
  phnNum: string;
};

export type IAuthResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export type IChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
