import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreatePostDto from './dto/createPost.dto';
import UpdatePostDto from './dto/updatePost.dto';
import  Post  from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import PostNotFoundException from './exception/postNotFound.exception';
@Injectable()
export default class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>
    ) {}

    getAllPosts(){
        return this.postsRepository.find();
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne(id);
        if (post) {
            return post;
        }
        throw new PostNotFoundException(id);
    }

    // replacePost(id: number, post: UpdatePostDto) {
    //     const postIndex = this.posts.findIndex(post => post.id === id);
    //     if (postIndex > -1) {
    //         this.posts[postIndex] = post;
    //         return post;
    //     }
    //     throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    // }

        async createPost(post: CreatePostDto) {
            const newPost = await this.postsRepository.create(post);
            await this.postsRepository.save(newPost);
            return newPost;
        }

    async updatePost(id: number, post: UpdatePostDto) {
        await this.postsRepository.update(id, post);
        const updatedPost = await this.postsRepository.findOne(id);
        if (updatedPost) {
            return updatedPost
        }
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    async deletePost(id: number) {
        const deleteResponse = await this.postsRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
    }
}
