// const initscrape = require('./initscrape.js')
const puppeteer = require('puppeteer');

const fs = require("fs")

const download = require("./download.js")
var url = require('url');

function getImgfilename(src) {

	var imagefilename = ""
	try {
		var pathname = url.parse(src).pathname;

		imagefilename = pathname.replace(/\//gi, "").replace(/\?/gi, "-")
	}
	catch (e) {

	}
	return imagefilename;
}

var doscrape = function (msg) {
	// var headless = typeof msg.showbrowser == "undefined" ? false : !msg.showbrowser
	var isdownload = false

	// var socket = io.connect('http://localhost:50276');

	puppeteer.launch({
		// executablePath: initscrape.location,
		args: ['--disable-extensions',
			'--proxy-server="direct://"',
			'--proxy-bypass-list=*', '--disable-notifications'],
		// headless: headless,
		ignoreHTTPSErrors: true
	})
		.then(
			async browser => {
				// console.log(browser)
				const baseurl = "https://shopee.co.id"
				const urldownload = "https://cf.shopee.co.id/file/"
				var data = msg.data;
				var datasend = new Array()
				const end = msg.end || 10;
				const start = msg.start || 0;

				var prgstart = 0;
				var prgend = end - start;

				for (var ctr = start; ctr < end; ctr++) {
					var dataurl = data[ctr][1]
					var name = data[ctr][2]
					var price = 0
					var rating = 0
					var shop = ''
					var location = ''
					var stock = 0
					var reviewcount = 0
					var weight = 0
					var shopdomain = ""
					var description = ""
					var sku = ""
					var otherdata = {}
					var categories = new Array()
					var imglink1 = "", imglink2 = "", imglink3 = "",
						imglink4 = "", imglink5 = ""

					const page = await browser.newPage();
					try {
						await page.setRequestInterception(true);

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
							console.log(response, 'dari sinih')
							const request = response.request();
							const urlreq = request.url();
							const urlparse = url.parse(urlreq)
							var pathname = urlparse.pathname;

							if (urlreq.includes('api/v2/item/get?itemid'
							)) {

								try {
									const content = await response.text()
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
										if (data['categories'] != null) {
											for (var j = 0; j < data.categories.length; j++) {
												var cat = data.categories[j]
												categories.push(cat['display_name'])
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
						// await page.addScriptTag({
						// path:__dirname+'/jquery-3.2.1.min.js'
						// })

						// 	 const description=await page.evaluate(()=>{
						// 	try{
						// 		return $(".qa-pd-description").html()
						// 	}
						// 	catch(err){
						// 		reject(err.toString())
						// 	}

						// })

						var img1 = "", img2 = "", img3 = "", img4 = "", img5 = ""
						if (isdownload) {
							if (fs.existsSync(msg.folder)) {

								if (imglink1 != "") {

									var imgresult = await download.download_image(imglink1,
										msg.folder + "\\" + getImgfilename(imglink1) + ".png")
									if (imgresult.status) {
										img1 = imgresult.img + ".png"
									}
								}
								if (imglink2 != "") {
									var imgresult = await download.download_image(imglink2, msg.folder + "\\" +
										getImgfilename(imglink2) + ".png")
									if (imgresult.status) {
										img2 = imgresult.img + ".png"
									}
								}
								if (imglink3 != "") {
									var imgresult = await download.download_image(imglink3, msg.folder + "\\" +
										getImgfilename(imglink3) + ".png")
									if (imgresult.status) {
										img3 = imgresult.img + ".png"
									}
								}
								if (imglink4 != "") {
									var imgresult = await download.download_image(imglink4, msg.folder + "\\" +
										getImgfilename(imglink4) + ".png")
									if (imgresult.status) {
										img4 = imgresult.img + ".png"
									}
								}
								if (imglink5 != "") {
									var imgresult = await download.download_image(imglink5, msg.folder + "\\" +
										getImgfilename(imglink5) + ".png")
									if (imgresult.status) {
										img5 = imgresult.img + ".png"
									}
								}
							}
						}


						var datainput =
						{
							name: name,
							sku: sku,
							price: price,
							rating: rating,
							description: description,
							link: dataurl,
							stock: stock,
							weight: weight,
							reviewcount: reviewcount,
							shop: shop,
							location: location,
							shopdomain: shopdomain,
							img1: img1,
							img2: img2,
							img3: img3,
							img4: img4,
							img5: img5,
							imglink1: imglink1,
							imglink2: imglink2,
							imglink3: imglink3,
							imglink4: imglink4,
							imglink5: imglink5

						}
						otherdata['Kategori'] = categories.join("|")
						Object.assign(datainput, otherdata)
						datasend.push(datainput)
					}
					catch (e) {
						datasend.push({
							name: name,
							link: dataurl,

							error: e.toString()
						})
						console.log("scrape page error " + e.toString())
					}
					prgstart += 1
					var progress = Math.abs(prgstart.toFixed() / prgend.toFixed() * 100)
					// socket.emit("progress", {
					// 	progress: progress,
					// 	store: msg.store,
					// 	tabid: msg.tabid,
					// 	id: msg.id
					// })

					await page.close()

				}
				console.log(datasend)
				// socket.emit("scraperesult", {
				// 	id: msg.id,
				// 	store: msg.store,
				// 	tabid: msg.tabid,
				// 	file: msg.file,
				// 	folder: msg.folder,
				// 	data: datasend
				// })
				await browser.close();

			})
		.catch((e) => {
			console.log(e.toString())
		})

}
exports.doscrape = doscrape;