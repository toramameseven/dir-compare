import { compareSync, compare, Options, fileCompareHandlers, Result } from "../../src"
import print from '../print'
import Streams from 'memory-streams'

interface Test {
    testId: string,
    left: string,
    right: string,
    description: string,
    options: Options,
    expected: string
}

const tests: Test[] = [
    {
        testId: '001',
        description: 'compare by file size',
        left:  '/tmp/37-perms/t1-files-and-dirs/a',
        right: '/tmp/37-perms/t1-files-and-dirs/b',
        options: { noDiffSet: false, compareSize: true, compareContent: true, handlePermissionDenied: true},
        expected: '{"distinct":8349,"equal":46887,"left":792,"right":1755,"distinctFiles":8349,"equalFiles":43361,"leftFiles":750,"rightFiles":1639,"distinctDirs":0,"equalDirs":3526,"leftDirs":42,"rightDirs":116,"brokenLinks":{"leftBrokenLinks":0,"rightBrokenLinks":0,"distinctBrokenLinks":0,"totalBrokenLinks":0},"same":false,"differences":10896,"differencesFiles":10738,"differencesDirs":158,"total":57783,"totalFiles":54099,"totalDirs":3684}'
    }

]

type CompareFn = (left: string, right: string, options: Options) => Promise<Result> | Result

async function runSingleTest(test: Test, compareFn: CompareFn) {
    const t1 = Date.now()
    const compareResult = await compareFn(test.left, test.right, test.options)
    const t2 = Date.now()
    const writer = new Streams.WritableStream()
    print(compareResult, writer, {showAll: true, wholeReport: true})
    const compareResultStr = JSON.stringify(writer.toString())
    if(test.testId==='001'){
        console.log(writer.toString())
    }
    const duration = (t2 - t1) / 1000
    const ok = compareResultStr === test.expected
    const testResult = ok ? `ok ${duration} s` : 'fail'
    console.log(`${test.testId} ${test.description}: ${testResult}`)
    if (!ok) {
        process.exit(1)
    }
}

async function main() {
    console.log("Start compare test")
    console.log('Sync')
    for (const test of tests) {
        await runSingleTest(test, compareSync)
    }

    console.log('Async')
    for (const test of tests) {
        // todo : uncomment
        // await runSingleTest(test, compare)
    }
    console.log("Done")
}

main()
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
