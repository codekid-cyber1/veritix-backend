import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, fullName, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 10);

    const user = this.userRepository.create({
      email,
      fullName,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt,
      isVerified: false,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error saving user');
    }

    await this.emailService.sendEmail({
      to: email,
      subject: 'Verify your account',
      html: `
        <h1>Welcome, ${fullName}!</h1>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return { message: 'Registration successful. Verification email sent.' };
  }
}
