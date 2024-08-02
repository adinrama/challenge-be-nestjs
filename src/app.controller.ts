import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
// import { AuthGuard } from './auth/guards/auth.guard'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  // @UseGuards(AuthGuard)
  @Get('protected-route')
  someProtectedRoute(@Req() req) {
    return {
      message: 'Accessed Resource',
      userId: req.userId
    }
  }
}
