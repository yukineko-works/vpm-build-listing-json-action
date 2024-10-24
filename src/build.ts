import fs from 'fs'
import crypto from 'crypto'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as cache from '@actions/cache'
import * as listing from './listing-config'
import * as fetch from './fetch'
import type * as VPMTypes from './@types/vpm'

type PackageCache = Record<string, VPMTypes.Artifact>

export async function build(): Promise<void> {
    const packages = {} as VPMTypes.VRCPackages['packages']

    // #region Load cache
    let cacheUpdated = false
    const disableCache = core.getBooleanInput('disable-cache')
    const cacheKey = core.getInput('cache-key') || 'cache-vpm-build-listing-json'
    const cacheFileName = 'vpm-build-listing-cache.json'

    let packageCache: PackageCache = {}

    if (!disableCache) {
        await cache.restoreCache([cacheFileName], 'vpm-build-listing-json-dummy', [cacheKey])

        try {
            if (!fs.existsSync(cacheFileName)) throw new Error('Cache file does not exist')
            const cacheData = JSON.parse(fs.readFileSync(cacheFileName, 'utf8')) as PackageCache
            packageCache = cacheData

            core.info(`Loaded ${Object.keys(packageCache).length} artifact(s) from cache`)
            core.debug(`Cache: ${JSON.stringify(packageCache)}`)
        } catch (error) {
            if (error instanceof Error) {
                core.warning(`Failed to load cache file: ${error.message}`)
            }
        }
    } else {
        core.debug('Skipping cache load')
    }
    // #endregion

    // #region Build packages
    const octokit = github.getOctokit(core.getInput('token'))
    const listingConfig = listing.getListingConfig()

    for (const repo of listingConfig.repositories) {
        const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
            owner: repo.owner,
            repo: repo.repoName,
        })
        for (const release of releases) {
            if (release.draft) continue

            let artifact: VPMTypes.Artifact

            const cacheKey = `${repo.owner}/${repo.repoName}/${release.tag_name}`
            if (cacheKey in packageCache) {
                core.debug(`Skipping ${cacheKey} as it is already cached`)
                artifact = packageCache[cacheKey]
            } else {
                const packageAsset = release.assets.find(asset => asset.name === 'package.json')
                if (!packageAsset) {
                    core.warning(`Failed to find package.json for ${cacheKey}`)
                    continue
                }

                artifact = await fetch.getJSON<VPMTypes.Artifact>(packageAsset.browser_download_url)

                const zipAsset = release.assets.find(asset => asset.name.endsWith('.zip'))
                if (!zipAsset) {
                    core.warning(`Failed to find zip asset for ${cacheKey}`)
                    continue
                }

                const zipUrl = zipAsset.browser_download_url
                const zipSHA256 = await fetch.getSHA256(zipUrl)

                artifact.url = zipUrl
                artifact.zipSHA256 = zipSHA256

                if (!disableCache) core.info(`Caching ${cacheKey}`)
                packageCache[cacheKey] = artifact
                cacheUpdated = true
            }

            if (!(artifact.name in packages)) {
                packages[artifact.name] = {
                    versions: {},
                }
            }

            packages[artifact.name].versions[artifact.version] = artifact
        }
    }
    // #endregion

    // #region Save cache
    if (!disableCache && cacheUpdated) {
        const stringifiedCache = JSON.stringify(packageCache)

        core.info(`Cache updated, saving ${Object.keys(packageCache).length} artifact(s).`)
        core.debug(`Cache: ${stringifiedCache}`)
        fs.writeFileSync(cacheFileName, stringifiedCache)

        const cacheHash = crypto.createHash('sha256').update(stringifiedCache).digest('hex')
        await cache.saveCache([cacheFileName], `${cacheKey}-${cacheHash}`)
    }
    // #endregion

    // #region Write packages
    const output = {
        name: listingConfig.name,
        id: listingConfig.id,
        url: listingConfig.url,
        author: listingConfig.author,
        packages,
    } satisfies VPMTypes.VRCPackages

    const outputFileName = core.getInput('output')
    fs.writeFileSync(outputFileName, JSON.stringify(output))
    // #endregion

    core.info(`Wrote ${Object.keys(packages).length} package(s) to ${outputFileName}`)
}
