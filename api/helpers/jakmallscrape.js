const initscrape=require('./initscrape.js')
const puppeteer = require('puppeteer-core');
var io = require('socket.io-client');
const $ = require('cheerio');
const fs = require("fs")
const request=require("request")
const download=require("./download.js")
const axios=require("axios")
var url  = require('url');
const hlp=require('./helper.js')
function getImgfilename(src){

	var imagefilename=""
	try{
	var pathname=url.parse(src).pathname;

		 imagefilename=pathname.replace(/\//gi,"").replace(/\?/gi,"-")
	}
	catch(e){

	}
	return imagefilename;
}
function getUrl(url){
	if(!url.startsWith('https')){
		return 'https:'+url
	}
	else return url;
}
var doscrape=function(msg){

var socket = io.connect('http://localhost:50276');



var headless=typeof msg.showbrowser=="undefined"?false:!msg.showbrowser
var isdownload=typeof msg.showimage=="undefined"?false:msg.showimage

puppeteer.launch({executablePath:initscrape.location,
args:['--disable-extensions',
 '--proxy-server="direct://"',
    '--proxy-bypass-list=*','--disable-notifications'],
headless:headless,
ignoreHTTPSErrors:true})
.then(
async browser => {
const baseurl="https://www.jd.id/"

var data=msg.data;
var datasend=new Array()
    	const end=msg.end;
    	const start=msg.start;
	 var prgstart=0;
   	 var prgend=end-start
   	 var arrayshop=new Array()
   for(ctr=start;ctr<end;ctr++){
    	var dataurl=data[ctr][1]
	  	var name=data[ctr][2]
			  	var price=0
			  	var rating=0
			  	var shop=''
			  	var location=''
	  			var stock=0
	  			var reviewcount=0
	  			var weight=0
	  			var shopdomain=""
	  			var description=""
	  			var sku=""
	  			var imglink1="",imglink2="",imglink3="",
	  			imglink4="",imglink5=""
	  			var sold=0
	  			 const page = await  browser.newPage(); 
	  			try{
			  await page.setRequestInterception(true);
	
			  page.on('request', interceptedRequest => {
		  	var urlc=interceptedRequest.url()
		  	var rectype=interceptedRequest.resourceType()
		  	var urlparse=url.parse(urlc)
		  	var hostname=urlparse.hostname;
		  	var pathname=urlparse.pathname;

		  		if (
		  		 	urlc.endsWith('.jpg')
		    	||
		    	urlc.endsWith('.png')
		    	||urlc.endsWith('.gif')
		    	||urlc.endsWith('.jpeg')
		    	||urlc.endsWith('.svg')
		    	||urlc.endsWith('.webp')
		    	||urlc.endsWith(".ico")
		    	||urlc.endsWith("pdp")
		    	||urlc.endsWith(".pl")
		    	||urlc.includes("data:image")
		    	||urlc.endsWith('.js')
		  	
		    	// ||hostnameblock.includes(urlc)
		    	// ||pathname.includes("video")
		    	// ||pathname.includes("talk")
		    	// ||pathname.includes("components/products/")
		    	// ||pathname.includes("/discussion")
		    	// ||pathname.includes("get_ab_test_download_apps")
		    	// ||pathname.includes("pixel")
		    	)
		   		 {
		   		
		    	interceptedRequest.abort()
		    	}
		    	else
		      	{ 
		      	
		      			if(!hostname.includes('jakmall')){
		      				interceptedRequest.abort()
		      			}
		      			else{
		      				interceptedRequest.continue();
		      			}
		      		
		      		 	

		      		
		      	}
		 
		  	
		  });
		
			  	 await page.goto(dataurl,{
					timeout:130000,
						waitUntil:['networkidle2']})
			  	 await page.addScriptTag({
	  				path:__dirname+'/jquery-3.2.1.min.js'
	  				})
			  
			  
			// console.log(datascrape)
		const targetEls = await page.$$('script');
		var img1="",img2="",img3="",img4="",img5=""
		var j=0;
			for(let target of targetEls){
  			const innerText = await page.evaluate(el => el.innerText, target)
  			if(innerText.includes('var spdt')){
  				var repltext=innerText.replace(/(\r?\n|\r)/gm, ' ')
  				var ftext='f=function(){'+
  				innerText+';return spdt;}.call(this)'
  				var jsdata=eval(ftext)
  				shop=jsdata.store.name;
  				sold=jsdata.sold;
  				shopdomain=jsdata.store.url;
  				var skukeys=Object.keys(jsdata.sku)
  				var skukey=skukeys[0]
  				var datasku=jsdata.sku[skukey]
  				if(datasku['sku']!=null)
  				sku=datasku['sku']
  				weight=datasku['weight']
  				price=datasku['price']['final']
  				if(datasku['in_stock']){
  					if(datasku['limited_stock']!=null){
  						stock=datasku['limited_stock']
  					}
  					else
  						stock='ADA'
  				}
  				else
  					stock='HABIS'
  			 reviewcount=jsdata.rating.summary.count;
  				 if(jsdata.rating.summary.average!=null){
  				 	rating=jsdata.rating.summary.average
  				 }
		  				 if(isdownload){
		  				 	if (fs.existsSync(msg.folder)) {
		  				 		var images=datasku['images']
  			
								 			if(typeof 	images[0] !="undefined"){
									 			var imgsrc=getUrl(images[0].detail)
									 			var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img1=imgresult.img
						      						imglink1=imgsrc;
						      						}
									 			}
									 			if(typeof images[1] !="undefined"){
									 			var imgsrc=getUrl(images[1].detail)
									 			var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img2=imgresult.img
						      						imglink2=imgsrc;
						      						}
									 			}
									 			if(typeof images[2] !="undefined"){
									 			var imgsrc=getUrl(images[2].detail)
									 			var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img3=imgresult.img
						      						imglink3=imgsrc;
						      						}
									 			}
									 			if(typeof images[3] !="undefined"){
									 			var imgsrc=getUrl(images[3].detail)
									 			var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img4=imgresult.img
						      						imglink4=imgsrc;
						      						}
									 			}
									 			if(typeof images[4] !="undefined"){
									 			var imgsrc=getUrl(images[4].detail)
									 			var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img5=imgresult.img
						      						imglink5=imgsrc;
						      						}
									 			}
		  				 	}
		  				 }
  											
	  				
  				}
  			
  			}
			 const targetdesc=await page.evaluate(()=>{
			 	return $('.dp__info.mce p').html()
			 })
			 const metadesc=await page.evaluate(()=>{
			 	return $('meta[property="og:description"]').attr('content')
			 })
			 if(metadesc!=null){
			 	var pattern=/dikirim dari (.*?)\./gi;
			 	var matchmeta=pattern.exec(metadesc)
			 	if(matchmeta.length>0)
			 		location=matchmeta[1]
			 }

			 if(typeof targetdesc!="undefined")
			 	description=hlp.cleanhtml1(targetdesc)
			 
			   


			    var datainput=
				  {
			  		name:name,
			  		sku:sku,
			  		price:price,
			  		rating:rating,
			  		description:description,
			  		link:dataurl,
			  		stock:stock,
			  		weight:weight,
			  		reviewcount:reviewcount,
			  		shop:shop,
			  		location:location,
			  		shopdomain:shopdomain,
			  		img1:img1,
			  		img2:img2,
			  		img3:img3,
			  		img4:img4,
			  		img5:img5,
			  		imglink1:imglink1,
			  		imglink2:imglink2,
			  		imglink3:imglink3,
			  		imglink4:imglink4,
			  		imglink5:imglink5,
			  		terjual:sold
			  	
			  	}
			
			 	
			  	 datasend.push(datainput)
			}
			catch(e){
				datasend.push({
 			 		name:name,
 			 		link:dataurl,

 			 		error:e.toString()
 			 	})
				console.log("scrape page error "+e.toString())
			}
			prgstart+=1
  				var progress=Math.abs(prgstart.toFixed()/prgend.toFixed()*100)
			  socket.emit("progress",{
			  	progress:progress,
			  		store:msg.store,
  					tabid:msg.tabid,
  					id:msg.id
			  })
			
  			await page.close()

	}
socket.emit("scraperesult",{
				id:msg.id,
  				store:msg.store,
  					tabid:msg.tabid,
  					file:msg.file,
  					folder:msg.folder,
  					data:datasend
  					})
await browser.close();

})
.catch((e)=>{
socket.emit('errorscrape',{msg:e.toString(),
id:msg.id})
})
}


exports.doscrape=doscrape;