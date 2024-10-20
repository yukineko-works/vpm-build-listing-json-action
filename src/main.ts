import * as core from '@actions/core'
import { build } from './build'

export async function run(): Promise<void> {
  try {
    await build()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
