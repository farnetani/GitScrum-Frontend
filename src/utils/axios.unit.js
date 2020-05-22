import axios from './axios'

describe('@utils/axios', () => {
  it('says hello', () => {
    const result = axios()
    expect(result).toEqual('hello')
  })
})
