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
	if(!url.startsWith('http')){
		return 'http:'+url
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
const baseurl="http://www.elevenia.co.id"

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
		  		 	||	urlc.endsWith('.css')
		  			
		    	||urlc.endsWith('.jpeg')
		    	||urlc.endsWith('.svg')
		    	||urlc.endsWith('.webp')
		    	||urlc.endsWith(".ico")
		    	||urlc.endsWith("pdp")
		    	||urlc.endsWith(".pl")
		    	||urlc.includes("data:image")
		    
		  	
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
		      	
		      			// if(!hostname.includes('elevenia')){
		      			// 	interceptedRequest.abort()
		      			// }
		      			// else{
		      				interceptedRequest.continue();
		      			//}
		      		
		      		 	

		      		
		      	}
		 
		  	
		  });
		
			  	 await page.goto(dataurl,{
					timeout:130000,
						waitUntil:['networkidle2']})
			  	 // await page.addScriptTag({
	  				// path:__dirname+'/jquery-3.2.1.min.js'
	  				// })
			  var img1="",img2="",img3="",img4="",img5=""
			  
			// console.log(datascrape)
		
			   const data=await page.evaluate(()=>{
			   		
			   			var price=0
			   			var description=""
			   				var stock=0
			   			if($(".price").length>0){
			   				 price=parseInt($(".price").text().replace(/Rp/gi,"")
			   					.replace(/\./,""))
			   				if(isNaN(price))
			   					price=0
			   			}
			   			var iframedesc=$("#prdDescIfrm")
			   			if(iframedesc.length>0){
			   				var iframecontent=iframedesc.contents()
			   				var tbldesc=iframecontent.find('table').first()
			   				var coldesc=tbldesc.find('td').first()
			   				description=coldesc.text()
			   			}
			   			var weight=parseInt($("#goodsWeight").val())
			   			if(isNaN(weight))
			   				weight=0
			   		
			   			if($("#optionStockHid0").length>0){
			   			 stock=parseInt($("#optionStockHid0").val())
			   			}
			   			else{
			   				stock=0
			   				$("select[name=optionData] option").each(function(idx,el){
			   					if(idx>0){
			   						var pattern=/stok\:([^\)]+)\)/gi
									var txtmatch=pattern.exec($(el).text())
									if(txtmatch!=null){
										if(txtmatch.length>0){
											var txtstock=txtmatch[1].trim()
											var stockval=parseInt(txtstock)
											if(isNaN(stockval))
												stockval=0
											stock+=stockval
										}
									}
			   					}
			   				})
			   			}

			   			if(isNaN(stock)){

			   				stock=0
			   			}
			   			var reviewcount=parseInt($("#reviewCount").text())
			   			if(isNaN(reviewcount))
			   				reviewcount=0
			   			var location=$(".placeStore").text().trim()
			   			var elshop=$(".storeNm")
			   			var shop=elshop.text().trim()
			   			var shopdomain=""
			   			if(elshop.length>0)
			   				shopdomain=elshop.attr("href")
			   			var imglink1=$('#dvThumPrdImg li:eq(0) a').attr('href')
			   			var imglink2=$('#dvThumPrdImg li:eq(1) a').attr('href')
			   			var imglink3=$('#dvThumPrdImg li:eq(2) a').attr('href')
			   			var imglink4=$('#dvThumPrdImg li:eq(3) a').attr('href')
			   			var imglink5=$('#dvThumPrdImg li:eq(4) a').attr('href')
			   			
			   			var databody={
			   				price:price,
			   			description:description,
			   			weight:weight,
			   			stock:stock,
			   			reviewcount:reviewcount,
			   			location:location,
			   			shop:shop,
			   			shopdomain:shopdomain,
			   			imglink1:imglink1,
			   			imglink2:imglink2,
			   			imglink3:imglink3,
			   			imglink4:imglink4,
			   			imglink5:imglink5
			   			}
			   			return databody
			   })
			 const targetEls = await page.$$('script');
			 for(let target of targetEls){
			 
  		const el=await page.evaluate(el =>{
  				var scr={
  					type:el.type,
  					innerText:el.innerText
  				}
  					return scr
  					} , 
  					target)
  				if(el.type=='application/ld+json'){
  					var js=JSON.parse(el.innerText)
  					if(js['aggregateRating']!=null){
  						if(js.aggregateRating['ratingValue']!=null){

  							rating=parseFloat(js.aggregateRating['ratingValue'])

  							if(isNaN(rating))
  								rating=0
  						}
  					}
  					break;
  				}
  						
  							
  				}
						if(isdownload){
		  				 	if (fs.existsSync(msg.folder)) {

		  				 				if(typeof data.imglink1!="undefined"){
		  				 				var imgsrc=data.imglink1
		  				 				var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img1=imgresult.img
						      						imglink1=imgsrc;
						      						}
									 	}
									 	if(typeof data.imglink2!="undefined"){
		  				 				var imgsrc=data.imglink2
		  				 				var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img2=imgresult.img
						      						imglink2=imgsrc;
						      						}
									 	}
									 	if(typeof data.imglink3!="undefined"){
		  				 				var imgsrc=data.imglink3
		  				 				var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img3=imgresult.img
						      						imglink3=imgsrc;
						      						}
									 	}
									 	if(typeof data.imglink4!="undefined"){
		  				 				var imgsrc=data.imglink4
		  				 				var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img4=imgresult.img
						      						imglink4=imgsrc;
						      						}
									 	}
									 	if(typeof data.imglink5!="undefined"){
		  				 				var imgsrc=data.imglink5
		  				 				var imgresult=await download.download_image(imgsrc,
						      					msg.folder+"\\"+getImgfilename(imgsrc))
						      					if(imgresult.status){
						      						img5=imgresult.img
						      						imglink5=imgsrc;
						      						}
									 	}

		  				 		}
		  				}
		  		
			    var datainput=
				  {
			  		name:name,
			  		sku:sku,
			  		price:data.price,
			  		rating:rating,
			  		description:data.description,
			  		link:dataurl,
			  		stock:data.stock,
			  		weight:data.weight,
			  		reviewcount:data.reviewcount,
			  		shop:data.shop,
			  		location:data.location,
			  		shopdomain:baseurl+data.shopdomain,
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