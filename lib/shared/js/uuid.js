// helper file to generate unique uuids
// "borrowed" from https://stackoverflow.com/a/62840229/3055043

const hex = '0123456789ABCDEF'

export function generateUUID() {
    let buffer = new Uint8Array(16)
    
    crypto.getRandomValues(buffer)

    buffer[6] = 0x40 | (buffer[6] & 0xF)
    buffer[8] = 0x80 | (buffer[8] & 0xF)

    let segments = []

    for (let i = 0; i < 16; ++i) {
        segments.push(hex[(buffer[i] >> 4 & 0xF)])
        segments.push(hex[(buffer[i] >> 0 & 0xF)])

        if (i == 3 || i == 5 || i == 7 || i == 9) {
            segments.push('-')
        }
    }

    return segments.join('')
}