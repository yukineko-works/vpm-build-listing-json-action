import fs from 'fs'
import * as core from '@actions/core'

export function getListingConfig() {
    const sourceJson = core.getInput('source')
    const config = {
        name: core.getInput('name'),
        id: core.getInput('id'),
        url: core.getInput('url'),
        author: core.getInput('author'),
        repositories: {} as { owner: string; repoName: string }[],
    }

    let repos = core.getInput('repositories').split('\n')

    if (sourceJson) {
        if (fs.existsSync(sourceJson)) {
            try {
                const sourceData = JSON.parse(fs.readFileSync(sourceJson, 'utf8'))
                config.name = sourceData?.name ?? config.name
                config.id = sourceData?.id ?? config.id
                config.url = sourceData?.url ?? config.url
                config.author = sourceData?.author?.name ?? config.author
                repos = sourceData?.githubRepos ?? repos
            } catch (error) {
                if (error instanceof Error) {
                    core.warning(`Failed to load source file: ${error.message}`)
                }
            }
        } else {
            core.warning(`Source file does not exist: ${sourceJson}`)
        }
    }

    // repositories format check
    config.repositories = repos
        .map(repo => {
            const split = repo.split('/')
            if (split.length !== 2) {
                core.warning(`Invalid repository format: ${repo}`)
                return null
            }
            return {
                owner: split[0],
                repoName: split[1],
            }
        })
        .filter(repo => repo != null)

    return config
}
