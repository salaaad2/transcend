import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService
    ) {}

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    getLastMatches(@Body() user: {username: string}, @Req() req: RequestWithUser) {
      return this.matchService.getmatches(user.username);
    }
}
