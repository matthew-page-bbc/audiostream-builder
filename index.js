const { Readable } = require('stream');
const debug = require('debug')('audiostream-builder');

class AudioStreamBuilder extends Readable {
    constructor(options = {}) {
        const defaults = {
            highWaterMark: 1000000,
            channels: 2,
            wordLength: 16
        };

        super({...defaults, ...options});
        this.options = {...defaults, ...options};

        debug('constructor', this.options);

        let bytesPerSample = this.options.wordLength / 8;
        let bytesPerFrame = bytesPerSample * this.options.channels;
        this.bufferSize = bytesPerFrame * 16384;
        
        this._initialiseBuffer();
    }

    addSample(sample) {
        debug('addSample', sample);
        if (this.options.wordLength == 16) {
            this._bufferPosition = this._buffer.writeInt16LE(sample, this._bufferPosition);
        }
        else {
            this._bufferPosition = this._buffer.writeInt32LE(sample, this._bufferPosition);
        }

        if (this._bufferPosition == this.bufferSize) {
            let pushed = this.push(this._buffer);
            if (!pushed) {
                this.emit('error', 'buffer overflow. highwatermark = ' + this.readableHighWaterMark);
                debug('addSample', 'warning: this.push() buffer overflow. highwatermark = ' + this.readableHighWaterMark);
            }

            this._initialiseBuffer();
        }
    }

    _initialiseBuffer() {
        this._buffer = null;
        this._buffer = Buffer.alloc(this.bufferSize, null, 'binary');
        this._bufferPosition = 0;
    }

    _read(size) {
        debug('_read', size);
    }
}

module.exports = AudioStreamBuilder