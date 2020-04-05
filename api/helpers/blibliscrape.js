const initscrape=require('./initscrape.js')
const puppeteer = require('puppeteer-core');
var io = require('socket.io-client');
const $ = require('cheerio');
const fs = require("fs")
const request=require("request")
const download=require("./download.js")
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
var doscrape=function(msg){
var headless=typeof msg.showbrowser=="undefined"?false:!msg.showbrowser
var isdownload=typeof msg.showimage=="undefined"?false:msg.showimage
var socket = io.connect('http://localhost:50276');
puppeteer.launch({executablePath:initscrape.location,
args:['--disable-extensions',
 '--proxy-server="direct://"',
    '--proxy-bypass-list=*','--disable-notifications',
    '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu',
  '--window-size=1920x1080'],
headless:headless,
ignoreHTTPSErrors:true})
.then(
async browser => {
const baseurl="https://www.blibli.com"
var data=msg.data;
var datasend=new Array()
    	const end=msg.end;
    	const start=msg.start;
	 var prgstart=0;
   	 var prgend=end-start
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
	  			var otherdata={}
	  			 const page = await  browser.newPage(); 
	  			
	  			try{
			  await page.setRequestInterception(true);
	
			  page.on('request', interceptedRequest => {
		  	var urlc=interceptedRequest.url()
		  	var rectype=interceptedRequest.resourceType()
		  	var urlparse=url.parse(urlc)
		  	var hostname=urlparse.hostname;
		  	var pathname=urlparse.pathname;
		  	if((
		  		hostname.includes("facebook")

				||hostname.includes("google")
		  		||hostname.includes("flixcar")
		  		||hostname.includes("image")
		  		||hostname.includes("testseek")
		  		||hostname.includes("vizury")
		  		||hostname.includes("media")
		  		||hostname.includes("criteo")
		  		||hostname.includes("alexa")
		  		||hostname.includes("flixfacts")
		  		||hostname.includes("newrelic")
				||hostname.includes("livechat")
		  		||hostname.includes("doubleclick")
		  		
		  		)
		  		
		  		){
		  		 interceptedRequest.abort();
		  	}
		  	else{

		  		if (
		  		urlc.endsWith('.css')
		  		||
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
		    	||interceptedRequest.resourceType() == 'font'
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

		      		interceptedRequest.continue();
		      	}
		    	
		    		 
		    		
		    }
		  });
		await page.on("response",async response => {
	
				 const request = response.request();
    				const urlreq = request.url();
    			const urlparse=url.parse(urlreq)
    			var pathname=urlparse.pathname;
    			
    			if(pathname.includes('backend/product/products') &&
    				(pathname.includes('summary')||pathname.includes('info'))
    				){
    		
    				try{
    				const content=await response.text()
    				var jsdata=JSON.parse(content)
    					if(jsdata['data']!=null){
    						var data=jsdata.data
    						if(data['sku']!=null){
    							sku=data.sku;
    						}
    						if(data['review']!=null){
    							if(data.review['count']!=null){
    								reviewcount=data.review.count;

    							}
    							if(data.review['rating']!=null){
    								rating=data.review.rating
    							}
    						}
    						if(data['status']!=null){
    							stock=data.status;
    						}
    						if(data['merchant']!=null){
    						shop=data.merchant.name;
    						shopdomain=data.merchant.url
    						location=data.merchant.location
    							}
		    					if(data['price']!=null){
		    						price=data.price.offered
		    					}
		    	
		    				if(data['description']!=null){
		    					
		    					description=

		    					hlp.cleanhtml1(data.description.replace(/<\/?img.*>/gi,""))
		    				}
		    				if(data['uniqueSellingPoint']!=null){
		    					description+-hlp.cleanhtml1(data.uniqueSellingPoint.replace(/<\/?img.*>/gi,""))
		    				}
		    				if(data['images']!=null){

		    					imglink1=data.images.length>0?data.images[0].full:""
		    					imglink2=data.images.length>1?data.images[1].full:""
		    					imglink3=data.images.length>2?data.images[2].full:""
		    					imglink4=data.images.length>3?data.images[3].full:""
		    					imglink5=data.images.length>4?data.images[4].full:""
		    					

		    				}
		    				if(data["specifications"]!=null){
		    					for(var j=0;j<data.specifications.length;j++){
		    						var spec=data.specifications[j]
		    						if(spec['name']!=null){
		    							if(spec.name.toLowerCase()=="berat"){
		    								var weightval=spec.value
		    								if(weightval.includes("kg")){
		    									weight=(parseFloat(weightval.replace(/,/g,"."))*1000)
		    								}
		    								else
		    								{
		    										weight=(parseFloat(weightval.replace(/,/g,".")))

		    								}
		    								if(isNaN(weight))
		    											weight=0
		    								
		    							}
		    							else{
		    								var keyname=hlp.getkeys(spec.name)
		    								var value=spec.value;
		    								otherdata[keyname]=value;
		    							}

		    						}

		    					}
		    				}

    					}
    					
    				}
    				catch(e){
    					console.log("error ndes"+e.toString())
    				}
    			}

    		})
			  	 await page.goto(dataurl,{
					timeout:130000,
						waitUntil:'networkidle2'})
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
			 
			 var img1="",img2="",img3="",img4="",img5=""
			    if(isdownload){
			    	if (fs.existsSync(msg.folder)) {
					    	if(imglink1!=""){

					      		var imgresult=await download.download_image(imglink1,
					      			msg.folder+"\\"+getImgfilename(imglink1))
					      		if(imgresult.status){
					      			img1=imgresult.img
					      			
					      		}
					      	}
					      	if(imglink2!=""){
					      		var imgresult=await download.download_image(imglink2,msg.folder+"\\"+
					      			getImgfilename(imglink2))
					      		if(imgresult.status){
					      			img2=imgresult.img
					      		}
					      	}
					      	if(imglink3!=""){
					      		var imgresult=await download.download_image(imglink3,msg.folder+"\\"+
					      			getImgfilename(imglink3))
					      		if(imgresult.status){
					      			img3=imgresult.img
					      		}
					      	}
					      	if(imglink4!=""){
					      		var imgresult=await download.download_image(imglink4,msg.folder+"\\"+
					      			getImgfilename(imglink4))
					      		if(imgresult.status){
					      			img4=imgresult.img
					      		}
					      	}
					      	if(imglink5!=""){
					      		var imgresult=await download.download_image(imglink5,msg.folder+"\\"+
					      			getImgfilename(imglink5))
					      		if(imgresult.status){
					      			img5=imgresult.img
					      		}
					      	}
					    }
			    }


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
			  		shopdomain:baseurl+shopdomain,
			  		img1:img1,
			  		img2:img2,
			  		img3:img3,
			  		img4:img4,
			  		img5:img5,
			  		imglink1:imglink1,
			  		imglink2:imglink2,
			  		imglink3:imglink3,
			  		imglink4:imglink4,
			  		imglink5:imglink5
			  	
			  	}
				Object.assign(datainput,otherdata)

			 	
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
console.log(e.toString())
})

}
exports.doscrape=doscrape;