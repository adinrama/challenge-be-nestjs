import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from './guards/auth.guard'
import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { RefreshTokenDto } from './dtos/refresh-token.dto'
import { SignupDto } from './dtos/signup.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData)
  }

  @Post('/login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials)
  }

  @Post('/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
  }

  @UseGuards(AuthGuard)
  @Get('/user/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id)
  }

  @UseGuards(AuthGuard)
  @Delete('/user/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id)
  }
}
