import { User } from '../entities/User'
import { MyContext } from 'src/types'
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from 'type-graphql'
import argon2 from 'argon2'
import { COOKIE_NAME } from '../contants'

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    const id = req.session.userId
    const user = await em.findOne(User, { id })

    return user
  }

  @Mutation(() => UserResponse)
  async register(@Arg('options') options: UsernamePasswordInput, @Ctx() { req, em }: MyContext): Promise<UserResponse> {
    const { username, password } = options

    if (username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    if (username.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 3'
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(password)
    const user = em.create(User, { username, password: hashedPassword })

    try {
      await em.persistAndFlush(user)
      req.session.userId = user.id
      req.session.user = user
    } catch (err) {
      if (err.detail.includes('already exists') || err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already token'
            }
          ]
        }
      }
    }

    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(@Arg('options') options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const { username, password } = options
    const user = await em.findOne(User, { username })

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'could not find a username'
          }
        ]
      }
    }

    const valid = await argon2.verify(user.password, password)

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password'
          }
        ]
      }
    }

    req.session.userId = user.id
    req.session.user = user

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME)
        if (err) {
          resolve(false)
          return
        }

        resolve(true)
      })
    )
  }
}
