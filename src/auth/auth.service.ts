import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './schemas/user.schema'
import { SignupDto } from './dtos/signup.dto'
import { LoginDto } from './dtos/login.dto'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { RefreshToken } from './schemas/refresh-token.schema'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name) private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService
  ) {}

  async signup(signupData: SignupDto) {
    const { name, email, password } = signupData

    const emailInUse = await this.UserModel.findOne({ email })
    if (emailInUse) {
      throw new BadRequestException('Email already in use')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword
    })
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials

    const user = await this.UserModel.findOne({ email })
    if (!user) {
      throw new UnauthorizedException('Wrong credentials')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials')
    }

    const tokens = await this.generateUserTokens(`${user._id}`)
    return {
      ...tokens,
      userId: user._id
    }
  }

  async refreshToken(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() }
    })

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid')
    }

    return this.generateUserTokens(`${token.userId}`)
  }

  async generateUserTokens(userId: string) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' })
    const refreshToken = uuidv4()

    await this.storeRefreshToken(refreshToken, userId)
    return {
      accessToken,
      refreshToken
    }
  }

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 2)

    await this.RefreshTokenModel.updateOne({ userId }, { $set: { expiryDate, token } }, { upsert: true })
  }

  async getUserById(id: string) {
    const user = await this.UserModel.findById(id)
    if (!user) {
      throw new NotFoundException('Id not found')
    }
    return user
  }

  async deleteUser(id: string) {
    const user = await this.UserModel.findByIdAndDelete(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }
  }
}
