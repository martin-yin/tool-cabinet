import axios, { Axios, AxiosRequestConfig } from 'axios'
import { GenerateRepositoryCodeOptionsType } from './interface'

export class RequestRepository {
  public service: Axios
  constructor({
    requestConfig,
    interceptorRequest = null,
    interceptorResponse = null
  }: Omit<GenerateRepositoryCodeOptionsType, 'baseFilePath' | 'domains'>) {
    this.service = axios.create(requestConfig)
    if (interceptorRequest) {
      this.service.interceptors.request.use(config => {
        return interceptorRequest(config)
      })
    }
    if (interceptorResponse) {
      this.service.interceptors.response.use(response => {
        return interceptorResponse(response)
      })
    }
  }

  request(config: AxiosRequestConfig<any>) {
    return this.service.request(config)
  }
}
