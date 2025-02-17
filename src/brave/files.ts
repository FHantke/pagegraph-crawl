import { rm, writeFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, parse } from 'node:path'

import { isDir } from './checks.js'

const createFilename = (url: URL): FilePath => {
  const fileSafeUrl = String(url).replace(/[^\w]/g, '_')
  const dateTimeStamp = Math.floor(Date.now() / 1000)
  return ['page_graph_', fileSafeUrl, '_', dateTimeStamp, '.graphml'].join('')
}

const createGraphMLPath = (args: CrawlArgs, url: URL): FilePath => {
  return (isDir(args.outputPath) === true)
    ? join(args.outputPath, createFilename(url))
    : args.outputPath
}

const createHARPath = (args: CrawlArgs, url: URL): FilePath => {
  const outputPath = createGraphMLPath(args, url)
  const pathParts = parse(outputPath)
  return pathParts.dir + '/' + pathParts.name + '.har'
}

export const createScreenshotPath = (args: CrawlArgs, url: URL): FilePath => {
  const outputPath = createGraphMLPath(args, url)
  const pathParts = parse(outputPath)
  return pathParts.dir + '/' + pathParts.name + '.png'
}

export const writeGraphML = async (args: CrawlArgs, url: URL,
                                   response: FinalPageGraphEvent,
                                   logger: Logger): Promise<undefined> => {
  try {
    const outputFilename = createGraphMLPath(args, url)
    logger.info('Writing PageGraph file to: ', outputFilename)
    await writeFile(outputFilename, response.data)
  }
  catch (err) {
    logger.error('saving Page.generatePageGraph output: ', String(err))
  }
}

export const writeHAR = async (args: CrawlArgs, url: URL, har: any,
                               logger: Logger): Promise<undefined> => {
  try {
    const outputFilename = createHARPath(args, url)
    logger.info('Writing HAR file to: ', outputFilename)
    await writeFile(outputFilename, JSON.stringify(har, null, 4))
  }
  catch (err) {
    logger.error('saving HAR file: ', String(err))
  }
}

export const deleteAtPath = async (path: FilePath): Promise<undefined> => {
  await rm(path, {
    recursive: true,
    force: true,
  })
}

export const createTempDir = async (dirPrefix = 'pagegraph-crawl-'): Promise<FilePath> => {
  return await mkdtemp(join(tmpdir(), dirPrefix))
}
