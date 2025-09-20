import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schemas/user.schema';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async signup(dto: SignUpDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({ email: dto.email, password: hashed, school_id: dto.school_id });
    await created.save();
    const payload = { sub: created._id, email: created.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async signin(dto: SignInDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user._id, email: user.email, school_id: user.school_id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
