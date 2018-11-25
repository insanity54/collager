const createCollage = require("photo-collage");
const glob = require('fast-glob');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const R = require('ramda');
const gm = require('gm').subClass({imageMagick: true});
const Promise = require('bluebird');
const gmp = Promise.promisifyAll(gm);

const photos = glob.sync(['wanikan-ez/**/*.png', 'wanikan-ez/**/*.jpg'], {absolute: true});

var fileSize = f => {
  return new Promise(function(resolve, reject) {
    gm(f).size((err, size) => {
      if (err) reject(err)
      resolve(size);
    });
  })
};


const photoSizes = R.map(fileSize, photos);
Promise.all(photoSizes).then(res => {
    const widthSum = R.sum(R.map(R.prop('width'), res));
    const heightSum = R.sum(R.map(R.prop('height'), res));
    const widthAverage = Math.floor(R.divide(widthSum, R.length(res)));
    const heightAverage = Math.floor(R.divide(heightSum, R.length(res)));
    const timestamp = moment().valueOf();
    const collageOptions = {
      sources: photos,
      width: Math.floor(photos.length / 2),
      height: Math.floor(photos.length / 2),
      imageWidth: widthAverage,
      imageHeight: heightAverage
    }

    createCollage(collageOptions)
      .then((canvas) => {
        const src = canvas.jpegStream();
        const outPath = path.join(__dirname, 'outputs', `collage-${timestamp}.jpg`);
        const dest = fs.createWriteStream(outPath);
        src.pipe(dest);
        console.log(`Collage created at file://${outPath}`)
      });

})
