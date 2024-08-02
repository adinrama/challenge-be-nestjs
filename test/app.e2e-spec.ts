import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication
  const email: string = 'adinrama.ap@yahoo.id'
  const password: string = 'qwert^123'
  const userId: string = '66acd559b3146a0471dba844'
  const accessToken: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmFjZDU1OWIzMTQ2YTA0NzFkYmE4NDQiLCJpYXQiOjE3MjI2MDI4NDUsImV4cCI6MTcyMjYzODg0NX0.E4tGWm0gZAy2HXJ44Hp9OWnCYU26x0SEI6bCUshy1uY'

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201)
      .then((response) => {
        expect(response.body.accessToken).toBeDefined()
        expect(response.body.refreshToken).toBeDefined()
      })
  }, 25000)

  it('/auth/user/:id (GET)', async () => {
    await request(app.getHttpServer())
      .get(`/auth/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body._id).toBeDefined()
        expect(response.body.email).toBeDefined()
      })
  }, 25000)

  afterAll(async () => {
    await app.close()
  })
})
