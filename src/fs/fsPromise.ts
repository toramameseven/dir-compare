import fs from 'fs'

export type BytesRead = number

export default {
    async readdir(path: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(files)
                }
            })
        })
    },
    async read(fd: number, buffer: Buffer, offset: number, length: number, position: number): Promise<BytesRead> {
        return new Promise((resolve, reject) => {
            fs.read(fd, buffer, offset, length, position, (err, bytesRead) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(bytesRead)
                }
            })
        })
    },
}
