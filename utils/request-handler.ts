import { APIRequestContext } from "@playwright/test"
import { APIlogger } from "./logger";
import { test } from "@playwright/test"


export class RequestHandler {

    private request: APIRequestContext
    private logger: APIlogger
    private baseUrl: string | undefined
    private defaultBaseUrl: string
    private apiPath: string = ''
    private queryParams: object = {}
    private apiHeaders: Record<string, string> = {}
    private apiBody: object = {}
    private defaultAuthToken: string     // есть
    private clearAuthFlag: boolean = false   // ← фикс: инициализация

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APIlogger, authToken: string = '') {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl
        this.logger = logger
        this.defaultAuthToken = authToken // ← фикс: сохраняем токен
    }

    url(url: string) {
        this.baseUrl = url
        return this
    }

    path(path: string) {
        this.apiPath = path
        return this
    }

    params(params: object) {
        this.queryParams = params
        return this
    }

    headers(headers: Record<string, string>) {
        // ← фикс: теперь не перезаписывает Authorization
        this.apiHeaders = { ...this.apiHeaders, ...headers }
        return this
    }

    body(body: object) {
        this.apiBody = body
        return this
    }

    clearAuth() {
        this.clearAuthFlag = true
        return this
    }

    async getRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await test.step(`GET request to: ${url}`, async () => {
            this.logger.logRequest('GET', url, this.getHeaders())
            const response = await this.request.get(url, {
                headers: this.getHeaders()
            })
            responseJSON = await response.json()
            this.cleanUpFields()

            this.logger.logResponse(response.status(), responseJSON)
            this.statusCodeValidator(response.status(), statusCode, this.getRequest)

        })

        return responseJSON
    }

    async postRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await test.step(`POST request to: ${url}`, async () => {
            this.logger.logRequest('POST', url, this.getHeaders(), this.apiBody)
            const response = await this.request.post(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            responseJSON = await response.json()
            this.cleanUpFields()

            this.logger.logResponse(response.status(), responseJSON)
            this.statusCodeValidator(response.status(), statusCode, this.postRequest)
        })


        return responseJSON
    }

    async putRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await test.step(`PUT request to: ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.getHeaders(), this.apiBody)
            const response = await this.request.put(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            responseJSON = await response.json()
            this.cleanUpFields()

            this.logger.logResponse(response.status(), responseJSON)
            this.statusCodeValidator(response.status(), statusCode, this.putRequest)
        })


        return responseJSON
    }

    async deleteRequest(statusCode: number) {
        const url = this.getUrl()
        await test.step(`POST request to: ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.getHeaders())
            const response = await this.request.delete(url, {
                headers: this.getHeaders()
            })
            this.cleanUpFields()

            this.logger.logResponse(response.status())
            this.statusCodeValidator(response.status(), statusCode, this.deleteRequest)
        })


    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`)
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value)
        }
        return url.toString()
    }

    private getHeaders() {
        if (!this.clearAuthFlag) {
            this.apiHeaders['Authorization'] =
                this.apiHeaders['Authorization'] || this.defaultAuthToken
        }
        return this.apiHeaders
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if (actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectedStatus} but got ${actualStatus}\n\nRecent API Activity \n${logs}`)
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }

    private cleanUpFields() {
        this.apiBody = {}
        this.apiHeaders = {}
        this.baseUrl = undefined
        this.apiPath = ''
        this.queryParams = {}
        this.clearAuthFlag = false
    }
}
