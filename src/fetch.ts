import * as crypto from 'crypto'
import fetch from 'node-fetch'

export async function getJSON<T>(url: string): Promise<T> {
    return fetch(url).then(res => res.json())
}

export async function getSHA256(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const hash = crypto.createHash('sha256')
            fetch(url).then(res => {
                res.body?.pipe(hash)
                res.body?.on('end', () => {
                    resolve(hash.digest('hex'))
                })
                res.body?.on('error', reject)
            })
        } catch (error) {
            reject(error)
        }
    })
}