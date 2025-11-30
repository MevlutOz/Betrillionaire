import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir email giriniz' })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalı' })
  password: string;

  @IsNotEmpty()
  name: string;
}