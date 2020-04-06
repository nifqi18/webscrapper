const url = require('url');
const puppeteer = require('puppeteer');
// const http_file = 'https://cf.shopee.co.id/file/'

// const initialWidgets = [
//   { id: 1, color: 'Red', sprocketCount: 7, owner: 'John' },
//   { id: 2, color: 'Taupe', sprocketCount: 1, owner: 'George' },
//   { id: 3, color: 'Green', sprocketCount: 8, owner: 'Ringo' },
//   { id: 4, color: 'Blue', sprocketCount: 2, owner: 'Paul' }
// ];

export function getWidgets(req, io) {
  const socket = io.sockets;
  let widgets = req.session.widgets;
  const abs = doscrape(socket)
  if (!widgets) {
    widgets = [];
    req.session.widgets = widgets;
  }
  return widgets;
}

export default function load(req, params, io) {
  return new Promise((resolve, reject) => {
    // make async call to database
    setTimeout(() => {
      resolve(getWidgets(req, io));
    }, 1000); // simulate async load
  });
}
const doscrape = async (socket) => {
  const dataurl = 'https://shopee.co.id';

  socket.emit('shoope', {
    status: 'start',
    message: 'Data mulai di ambil ..'
  });

  puppeteer.launch({
    // executablePath: 'google-chrome-unstable',
    args: ['--disable-gpu', '--no-sandbox', '--single-process', '--disable-web-security']
  }).then(async browser => {
    const page = await browser.newPage();
    try {
      await page.setRequestInterception(true);
      page.once('domcontentloaded', () => {
        socket.emit('shoope', {
          status: 'ready',
          message: 'Page is ready'
        })
      });
      page.once('load', () => {
        socket.emit('shoope', {
          status: 'load',
          message: 'Page is Load'
        })
      });
      page.once('close', () => {
        socket.emit('shoope', {
          status: 'close',
          message: 'Page is Close'
        })
      });
      page.on('request', interceptedRequest => {
        var urlc = interceptedRequest.url()
        var rectype = interceptedRequest.resourceType()
        var urlparse = url.parse(urlc)
        var hostname = urlparse.hostname;
        var pathname = urlparse.pathname;
        if (

          hostname.includes("facebook") ||
          hostname.includes("google") ||
          pathname.includes("/file/")

        ) {
          interceptedRequest.abort();
        }
        else {

          if (

            urlc.endsWith('.jpg')
            ||
            urlc.endsWith('.png')
            || urlc.endsWith('.gif')
            || urlc.endsWith('.jpeg')
            || urlc.endsWith('.svg')
            || urlc.endsWith('.webp')
            || urlc.endsWith(".ico")
            || urlc.endsWith("pdp")
            || urlc.endsWith(".pl")
            || urlc.includes("data:image")

            // ||hostnameblock.includes(urlc)
            // ||pathname.includes("video")
            // ||pathname.includes("talk")
            // ||pathname.includes("components/products/")
            // ||pathname.includes("/discussion")
            // ||pathname.includes("get_ab_test_download_apps")
            // ||pathname.includes("pixel")
          ) {

            interceptedRequest.abort()
          }
          else {

            interceptedRequest.continue();
          }



        }
      });
      await page.on("response", async response => {
        // console.log(response, 'dari sinih')
        const request = response.request();
        const urlreq = request.url();
        const urlparse = url.parse(urlreq)

        if (urlreq.includes('api/v2/category_list/get')) {
          const _content = await response.text();
          const _jsdata = JSON.parse(_content);
          const _data = _jsdata['data'];
          socket.emit('shoope', {
            status: 'parsing_url',
            data: _data
          });

        }

        if (urlreq.includes('api/v2/item/get?itemid')) {
          console.log('get itemkah')
          try {
            const content = await response.text();
            // console.log(content)
            var jsdata = JSON.parse(content)
            if (jsdata['item'] != null) {
              var data = jsdata.item
              if (data['description'] != null) {
                description = data.description.replace(/[^\x00-\x7F]/g, "");
              }

              if (data['images'] != null) {

                imglink1 = data.images.length > 0 ? urldownload + data.images[0] : ""
                imglink2 = data.images.length > 1 ? urldownload + data.images[1] : ""
                imglink3 = data.images.length > 2 ? urldownload + data.images[2] : ""
                imglink4 = data.images.length > 3 ? urldownload + data.images[3] : ""
                imglink5 = data.images.length > 4 ? urldownload + data.images[4] : ""


              }
              if (data['price'] != null) {
                price = data.price / 100000
              }
              if (data['stock'] != null) {
                stock = data.stock
              }
              if (data['item_rating'] != null) {
                if (data.item_rating['rating_star'] != null) {
                  rating = data.item_rating.rating_star;
                }
                if (data.item_rating['rcount_with_context'] != null) {
                  reviewcount = data.item_rating.rcount_with_context
                }
              }
              if (data['shop_location'] != null) {
                location = data.shop_location;
              }
              if (data['models'] != null) {
                for (var j = 0; j < data.models.length; j++) {
                  var model = data.models[j]
                  var idx = j + 1
                  var pricevariant = model.price / 100000
                  otherdata['Variant' + idx] = model.name + '|' + pricevariant + '|' + model.stock;


                }

              }


            }

          }
          catch (e) {
            console.log("error ndes" + e.toString())
          }
        }
        else if (urlreq.includes('api/v2/shop/get?is_brief')) {
          try {
            const content = await response.text()
            var jsdata = JSON.parse(content)
            var data = jsdata.data;
            if (data['account'] != null) {
              if (data.account['username'] != null) {
                shop = data.account.username;
                shopdomain = baseurl + '/' + shop;
              }
            }
          }
          catch (e) {
            console.log("error ndes2" + e.toString())
          }
        }

      })
      await page.goto(dataurl, {
        timeout: 130000,
        waitUntil: 'networkidle2'
      })
      await page.waitFor(3000);

      browser.on('disconnected', () => {
        console.log(`Browser Disconnected... Process Id: `);
      })
      // browser.on('disconnected', () => {
      //   console.log('sleeping 100ms'); //  sleep to eliminate race condition  
      //   setTimeout(function () {
      //     console.log(`Browser Disconnected... Process Id: ${process}`);
      //     // child_process.exec(`kill -9 ${process}`, (error, stdout, stderr) => {
      //     //   if (error) {
      //     //     console.log(`Process Kill Error: ${error}`)
      //     //   }
      //     //   console.log(`Process Kill Success. stdout: ${stdout} stderr:${stderr}`);
      //     // });
      //   }, 100);

      await browser.close();
    } catch (e) {
      console.log(e)
    }
  }).catch(e => {
    console.log(e.toString())
  });




}