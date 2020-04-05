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
    '--proxy-bypass-list=*','--disable-notifications'],
headless:headless,
ignoreHTTPSErrors:true})
.then(
async browser => {
const baseurl="https://www.bukalapak.com"
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
			  	var shop=data[ctr][5]
			  	var location=data[ctr][6]
	  			var stock=0
	  			var reviewcount=0
	  			var shopdomain=""
	  			var weight=0
	  			var sku=""
	  			var imglink1="",imglink2="",imglink3="",
	  			imglink4="",imglink5=""
	  			 const page = await  browser.newPage(); 
	  			try{
			  await page.setRequestInterception(true);
	
			  page.on('request', interceptedRequest => {
		  	var urlc=interceptedRequest.url()
		  	var rectype=interceptedRequest.resourceType()
		  	var urlparse=url.parse(urlc)
		  	var hostname=urlparse.hostname;
		  	var pathname=urlparse.pathname;
		  	const hostnameblock=["t.bukalapak.com","attache.bukalapak.com"]
		  	const pathnameblock=[
		  	"global.fingerprint"
		  	]
		  	if(!hostname.includes("bukalapak")
		  		
		  		){
		  		 interceptedRequest.abort();
		  	}
		  	else{

		  		if (urlc.endsWith('.css')||
		    	urlc.endsWith('.jpg')||
		    	urlc.endsWith('.png')
		    	||urlc.endsWith('.gif')
		    	||urlc.endsWith('.jpeg')
		    	||urlc.endsWith('dekstop')
		    	||urlc.endsWith('.svg')
		    	||urlc.endsWith('.webp')
		    	||urlc.endsWith(".ico")
		    	||urlc.endsWith("pdp")
		    	||urlc.endsWith(".pl")
		    	||urlc.includes("data:image")
		    	||urlc.includes(".js")
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
			  	 await page.goto(dataurl,{
					timeout:30000,
						waitUntil:'load'})
			  	 await page.addScriptTag({
	  				path:__dirname+'/jquery-3.2.1.min.js'
	  				})
			  
			  // 	 const description=await page.evaluate(()=>{
			  // 	try{
			  // 		return $(".qa-pd-description").html()
			  // 	}
			  // 	catch(err){
			  // 		reject(err.toString())
			  // 	}
			  	
			  // })
			  stock=await page.evaluate(()=>{
			  		try{
			  		var stock=parseFloat($("#product-detail-quantity").data("max-value"))
			  		if(isNaN(stock))
			  			stock=0
			  		return stock

			  	}
			  	catch(err){
			  		
			  		}
			  	})
		
			  const script=await page.evaluate(()=>{

			  	var txtscr=""
			  	$("script").each((idx,scr)=>{
			  		if($(scr).attr("type")=="application/ld+json"){
			  			var scrtxt=$(scr).text()
			  			if(scrtxt.match(/\"description\"/gi)!=null){
			  				txtscr=scrtxt.replace(/\@/gi,"")
			  				return false
			  			}
			  		}
			  	})
			  	return txtscr
			  })
			  try{
			  var jsdata=JSON.parse(script)
			  var description=jsdata.description
			  if(jsdata["aggregateRating"]!=null){

			
			  	
			  		if(jsdata.aggregateRating["ratingValue"]!=null){
			  			rating=parseFloat(jsdata.aggregateRating.ratingValue)
			  			if(isNaN(rating))
			  				rating=0
			  		}
			  		if(jsdata.aggregateRating["reviewCount"]!=null){
			  			reviewcount=parseInt(jsdata.aggregateRating.reviewCount)
			  			if(isNaN(reviewcount))
			  				reviewcount=0
			  		}
			  	
			  }
			  if(jsdata['offers']!=null){
			  	if(jsdata.offers['price']!=null){
			  		price=parseInt(jsdata.offers.price)
			  		if(isNaN(price)){
			  			price=0
			  		}
			  	}
			  }
			}
			catch(e){
				console.log(" error evaluate "+e.toString())
			}
			
			   location=await page.evaluate(()=>{
			   		var location=$(".qa-seller-location").text()
			   		return location.replace(/\n/gi,"")
			   })
			   shopdomain=await page.evaluate(()=>{
			   	var href=$(".qa-seller-name").attr("href")
			   		if(typeof href=="undefined"){
			   			href=""
			   		}
			   		return href
			   })
			   weight=await page.evaluate(()=>{
			   	var weightel=$(".qa-pd-weight").text().trim()
			   	var weight=0
			   	if(weightel.includes('kilogram')){
			   		weight=parseFloat(weightel)*1000

			   	}
			   	else
			   		weight=parseFloat(weightel)
			   	if(isNaN(weight))
			   		weight=0;
			   	return weight;
			   })
			   sku=await page.evaluate(()=>{
			   		var sku=$('.product-detail-track').data('sku');
			   		if(typeof sku!="undefined")
			   			return sku.toString();
			   })

			   var otherdatael=await page.evaluate(()=>{
			   	var dtarray=[[],[]]
			   	var dtkeys=dtarray[0]
			   	var dtvalues=dtarray[1]

			   		$('.qa-pd-attribute-label').each(function(idx,el){
			   			if($('.qa-pd-attribute-value').eq(idx).length>0){
			   			dtkeys.push($(el).text().trim().replace(/\n\r/gi,""))
			   			dtvalues.push($('.qa-pd-attribute-value').eq(idx).text().trim().replace(/\n\r/gi,""))
			   			}
			   		})
			   		return dtarray
			   		
			   })
			   var dtkeys=otherdatael[0]
			   var dtvalues=otherdatael[1];
			
			   var otherdata={}
			   for(var j=0;j<dtkeys.length;j++){

			   		otherdata[hlp.getkeys(dtkeys[j])]=dtvalues[j]
			   }
			   var kategori=await page.evaluate(()=>{
			   	var el=$("ul[itemtype='http://schema.org/BreadcrumbList'] li")
			   	var kategories=new Array()
			   		el.each(function(idx,val){
			   			if(idx>0 && idx<el.length-1)
			   				kategories.push($(val).text())
			   		})
			   		return kategories.join("|").replace(/\n/gi,"").trim()
			   })
			  
			      var img1="",img2="",img3="",img4="",img5=""
			      if(isdownload){

			      	if (fs.existsSync(msg.folder)) {
					      var img=await page.evaluate(()=>{
					      	var img1=$(".js-product-image-gallery__main a:eq(0)").attr("href")
					      	var img2=$(".js-product-image-gallery__main a:eq(1)").attr("href")
					      	var img3=$(".js-product-image-gallery__main a:eq(2)").attr("href")
					      	var img4=$(".js-product-image-gallery__main a:eq(3)").attr("href")
					      	var img5=$(".js-product-image-gallery__main a:eq(4)").attr("href")
							 return {
							 	img1:img1,
							 	img2:img2,
							 	img3:img3,
							 	img4:img4,
							 	img5:img5
							 }
					      })
					      	if(typeof img.img1!="undefined"){

					      		var imgresult=await download.download_image(img.img1,msg.folder+"\\"+getImgfilename(img.img1))
					      		if(imgresult.status){
					      			img1=imgresult.img
					      			imglink1=img.img1
					      		}
					      	}
					      	if(typeof img.img2!="undefined"){
					      		var imgresult=await download.download_image(img.img2,msg.folder+"\\"+getImgfilename(img.img2))
					      		if(imgresult.status){
					      			img2=imgresult.img
					      			imglink2=img.img2
					      		}
					      	}
					      	if(typeof img.img3!="undefined"){
					      		var imgresult=await download.download_image(img.img3,msg.folder+"\\"+getImgfilename(img.img3))
					      		if(imgresult.status){
					      			img3=imgresult.img
					      			imglink3=img.img3
					      		}
					      	}
					      	if(typeof img.img4!="undefined"){
					      		var imgresult=await download.download_image(img.img4,msg.folder+"\\"+getImgfilename(img.img4))
					      		if(imgresult.status){
					      			img4=imgresult.img
					      			imglink4=img.img4
					      		}
					      	}
					      	if(typeof img.img5!="undefined"){
					      		var imgresult=await download.download_image(img.img5,msg.folder+"\\"+getImgfilename(img.img5))
					      		if(imgresult.status){
					      			img5=imgresult.img
					      			imglink5=img.img5
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
			    Object.assign(datainput,{"Kategori":kategori})
			 	
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