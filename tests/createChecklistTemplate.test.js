const request = require('supertest')
const app = require('../server')

describe('Create Checklist Template', () => {
  it('should create new checklist template', async () => {
    const res = await request(app)
      .post('/checklists/templates')
      .set('Accept', 'application/json')
      .set('Authorization', 'edf2dadb9d90078ca4a2e2805a486a06af2e4f33')
      .send({
        data: {
          attributes: {
            name: 'foo template',
            checklist: {
              description: 'my checklist',
              due_interval: 3,
              due_unit: 'hour'
            },
            items: [
              {
                description: 'my foo item',
                urgency: 2,
                due_interval: 40,
                due_unit: 'minute'
              },
              {
                description: 'my bar item',
                urgency: 3,
                due_interval: 30,
                due_unit: 'minute'
              }
            ]
          }
        }
      })

    expect(res.statusCode).toEqual(201);
  })
})