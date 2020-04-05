const initscrape=require('./initscrape.js')
const puppeteer = require('puppeteer-core');
var io = require('socket.io-client');
const $ = require('cheerio');
const fs = require("fs")
const request=require("request")
const axios=require("axios")
var url  = require('url');
const hlp=require('./helper.js')

function getSrc(img,idximage){
	var fullsrc=""
	try{
	$(img).find('.content-img-relative').each(function(idx,val){
		if(idx==idximage){
		 fullsrc=$(val).find('img').attr('src')

		return false
		}
	})
		
	}

	catch(e){
		
	}

	return typeof(fullsrc)=="undefined"?"":fullsrc;
}
function getImgfilename(img,idx){
	var fullsrc=getSrc(img,idx)
	var imagefilename=""
	try{
	var pathname=url.parse(fullsrc).pathname;

		 imagefilename=pathname.replace(/\//gi,"").replace(/\?/gi,"-")
	}
	catch(e){

	}
	return imagefilename;
}
const download_image = (url, image_path) => axios({
  url: url,
  responseType: 'stream',
  timeout:1000,
}).then(response => {

	
  response.data.pipe(fs.createWriteStream(image_path));

  return {
    status: true,
   img:image_path
  };
}).catch(error => ({
  status: false,
  img:image_path
}));
var doscrape=function(msg){
var isdownload=typeof msg.showimage=="undefined"?false:msg.showimage
var socket = io.connect('http://localhost:50276');
puppeteer.launch({executablePath:initscrape.location,
args:['--disable-extensions',
 '--proxy-server="direct://"',
    '--proxy-bypass-list=*','--disable-notifications'],
headless:false,
ignoreHTTPSErrors:true})
.then(
async browser => {

var data=msg.data;
// Create a new page inside context.
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
			  	var location=""
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
		  	const hostnameblock=["chat.tokopedia.com",
		  	"goldmerchant.tokopedia.com","inbox.tokopedia.com",
		  	"ta.tokopedia.com","accounts.tokopedia.com",
		  	"kero.tokopedia.com",
		  	"tokopedia.api.useinsider.com","pay.tokopedia.com"]
		  	const pathnameblock=[
		  	"global.fingerprint"
		  	]
		  	if(!hostname.includes("tokopedia")
		  		
		  		)
		  	{
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

		    	||pathname.includes("/img/")
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
    			if(urlreq=="https://gql.tokopedia.com/query"){
    				try{
    				const content=await response.text()
    				const jsdata=JSON.parse(content)

    					if(jsdata["data"]!=null){
    					
    						if(jsdata.data["GetNearestWarehouse"]!=null){
    							//console.log(jsdata.data.GetNearestWarehouse)
    							stock=jsdata.data.GetNearestWarehouse.data[0].stock;
    							price=jsdata.data.GetNearestWarehouse.data[0].price;
    						}
    					}
    				}
    				catch(err){
    					//console.log(" on stock response "+err.toString())
    				}
    			}
    			else if(pathname.match(/\/reputationapp\/review/gi)){
    				try{
    					const content=await response.text()
    				const jsdata=JSON.parse(content)
    						if(jsdata["data"]!=null){
    							if(jsdata.data["total_review"]!=null){
    								reviewcount=jsdata.data.total_review
    							}
    							if(jsdata.data["rating_score"]!=null){
    								rating=parseFloat(jsdata.data.rating_score)
    							}
    						}
    				}
    				catch(err){
    					//console.log(" on review "+err.toString())
    				}
    			}
		})
	  	await page.goto(dataurl,{
timeout:30000,
waitUntil:'load'})
	  	await page.addScriptTag({
	  		path:__dirname+'/jquery-3.2.1.min.js'
	  	})
			  const description=await page.evaluate(()=>{
			  	try{
			  		return $("#info").html().replace(/<br>/gi,'\r\n')
			  	}
			  	catch(err){
			  		throw err.toString()
			  	}
			  	
			  })
			 const img=await page.evaluate(()=>{
			 	try{
			 		return $(".container.container-product").html()
			 	}
			 	catch(err){
			 		throw err.toString()
			 	}
			 })
			 location=await page.evaluate(()=>{
			 	
			 		return $('span[itemprop="addressLocality"]').text().trim()
			 	
			 })
			 shopdomain=await page.evaluate(()=>{
			 	try{
			 		return typeof $("#shop-name-info").closest("a").attr("href")=="undefined"?"":$("#shop-name-info").closest("a").attr("href")
			 	}
			 	catch(err){
			 		return ""
			 	}
			 })
			 weight=await page.evaluate(()=>{
			 	var wght=0
			 	var weightel=$('.rvm-shipping--weight .rvm-shipping-content')
			 	if(weightel.length>0){
			 		var weightxt=weightel.text().trim().replace(/\./gi,'')
			 		wght=parseFloat(weightxt)
			 		if(isNaN(wght))
			 			wght=0
			 		if(weightxt.includes("kg")||weightxt.includes("kilogram"))
			 		wght=wght*1000
			 		
			 	}
			 	return wght;
			 	
			 })
			 var cat=await page.evaluate(()=>{
			 	var catlist=
			 	new Array()
			 	$(".breadcrumb li[itemprop='itemListElement']").each(function(idx,el){
			 		if(idx>0){
			 			catlist.push($(el).text().trim().replace(/\n/gi,''))
			 		}
			 	})
			 	return catlist;
			 })
			 var img1="",img2="",img3="",img4="",img5=""
			 imglink1=getSrc(img,0)
			 imglink2=getSrc(img,1)
			 imglink3=getSrc(img,2)
			 imglink4=getSrc(img,3)
			 imglink5=getSrc(img,4)
			 if(isdownload){
			 		if (fs.existsSync(msg.folder)) {


					 if(imglink1!=""){
					 	var imgpath=msg.folder+"\\"+
					 	hlp.getImageName(getImgfilename(img,0))
					 	var imgdwnld=await download_image(imglink1,imgpath)
					 	if(imgdwnld.status)
					 		img1=imgpath
					 }
					 if(imglink2!=""){
						var imgpath=msg.folder+"\\"+
						hlp.getImageName(getImgfilename(img,1))
					 	var imgdwnld=await download_image(imglink2,imgpath)
					 	if(imgdwnld.status)
					 		img2=imgpath
					 }
					 if(imglink3!=""){
						var imgpath=msg.folder+"\\"+
						hlp.getImageName(getImgfilename(img,2))
					 	var imgdwnld=await download_image(imglink3,imgpath)
					 	if(imgdwnld.status)
					 		img3=imgpath
					 }
					 if(imglink4!=""){
						var imgpath=msg.folder+"\\"+
						hlp.getImageName(getImgfilename(img,3))
					 	var imgdwnld=await download_image(imglink4,imgpath)
					 	if(imgdwnld.status)
					 		img4=imgpath
					 }
					 if(imglink5!=""){
						var imgpath=msg.folder+"\\"+
						hlp.getImageName(getImgfilename(img,4))
					 	var imgdwnld=await download_image(imglink5,imgpath)
					 	if(imgdwnld.status)
					 		img5=imgpath
					 }
				}
			}
			


				  var descr=hlp.cleanhtml1(description);


				  var datainput=
				  {
			  		name:name,
			  		sku:sku,
			  		price:price,
			  		rating:rating,
			  		description:descr,
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
			  		imglink5:imglink5
			  	}
			    var kategori={"Kategori":cat.join("|")}
			    Object.assign(datainput,kategori)
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
	console.log("browser error "+e.toString())
});
}
exports.doscrape=doscrape;