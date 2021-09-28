import { Module } from '@nestjs/common';
import PostController from './posts.controller';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import Post from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Post])],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
