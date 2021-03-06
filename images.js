let fs = require('fs');
const Images = require('./models/Images').Images
let imageData = fs.readFileSync('/home/vaibhav/Pictures/Wallpapers/5cm per sec.jpg');

Images.create({
    image: imageData
}).catch((err) => {
    console.log(err)
})
