import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { validateSchema } from '../utils/schema-validator';
import articleRequestPayload from '../request-objects/POST-article.json'

test('Get Articles', async ({ api }) => {

    const response = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .clearAuth()
        .getRequest(200)
    await expect(response).shouldMatchSchema('articles', 'GET_articles')
    expect(response.articles.length).shouldBeLessThanOrEqual(10)
    expect(response.articlesCount).shouldEqual(10)

    const response2 = await api
        .path('/tags')
        .getRequest(200)

    expect(response2.tags[0]).shouldEqual('Test')
    expect(response2.tags.length).toBeLessThanOrEqual(10)
})

test('Get Test Tags', async ({ api }) => {
    const response = await api
        .path('/tags')
        .getRequest(200)
        await expect(response).shouldMatchSchema('tags', 'GET_tags', true)
    expect(response.tags[0]).shouldEqual('Test')
    expect(response.tags.length).toBeLessThanOrEqual(10)
})

test('Create and Delete Article', async ({ api }) => {
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))
articleRequest.article.title = 'This is a new title'
    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201)
        await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual('This is a new title')
    const slugId = createArticleResponse.article.slug

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)

    expect(articlesResponse.articles[0].title).shouldEqual('This is a new title')

    await api
        .path(`/articles/${slugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)

    expect(articlesResponseTwo.articles[0].title).not.shouldEqual('This is a new title')
})

test('Create, Update and Delete Article', async ({ api }) => {

    const createArticleResponse = await api
        .path('/articles')
        .body({
            "article": {
                "title": "TEST100",
                "description": "test100",
                "body": "test100",
                "tagList": ["Lorem"]
            }
        })
        .postRequest(201)

    expect(createArticleResponse.article.title).shouldEqual('TEST100')
    const slugId = createArticleResponse.article.slug

    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        .body({
            "article": {
                "title": "TEST100 Modified!",
                "description": "test100",
                "body": "test100",
                "tagList": ["Lorem"]
            }
        })
        .putRequest(200)

    expect(updateArticleResponse.article.title).shouldEqual('TEST100 Modified!')
    const newSlugId = updateArticleResponse.article.slug

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)

    expect(articlesResponse.articles[0].title).shouldEqual('TEST100 Modified!')

    await api
        .path(`/articles/${newSlugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)

    expect(articlesResponseTwo.articles[0].title).not.shouldEqual('TEST100 Modified!')
})
