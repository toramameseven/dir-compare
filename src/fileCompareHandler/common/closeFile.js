const fs = require('fs')

function closeFilesSync(fd1, fd2) {
    if (fd1) {
        fs.closeSync(fd1)
    }
    if (fd2) {
        fs.closeSync(fd2)
    }
}

function closeFilesAsync(fd1, fd2, fdQueue) {
    if (fd1 && fd2) {
        return fdQueue.closePromise(fd1).then(() => fdQueue.closePromise(fd2))
    }
    if (fd1) {
        return fdQueue.closePromise(fd1)
    }
    if (fd2) {
        return fdQueue.closePromise(fd2)
    }
}


module.exports = {
    closeFilesSync: closeFilesSync,
    closeFilesAsync: closeFilesAsync
}
