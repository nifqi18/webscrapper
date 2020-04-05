const fs = require("fs")
const request=require("request")
const axios=require("axios")


var download_image = (url, image_path) => axios({
  url: url,
  responseType: 'stream',
   timeout:10000,
}).then(response => {

	
  response.data.pipe(fs.createWriteStream(image_path));

  return {
    status: true,
   img:image_path
  };
}
).catch(error => 
({

  status: false,
  img:image_path
})
);
exports.download_image=download_image