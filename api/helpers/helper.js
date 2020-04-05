const bwde="Browser chrome versi developer tidak ada."+"\n"+
"Install browser chrome versi developer dulu."
const fs = require("fs")
var cleanhtml1=function(html){

	var result=html.replace(/[^\x00-\x7F]/g, "")
	result=result.replace(/<[\/]?p.*?>/gi,"")
	result=result.replace(/<[\/]?div.*?>/gi,"")
	result=result.replace(/<[\/]?h.*?>/gi,"")
	result=result.replace(/<br.*?>/gi,"\r\n")
	result=result.replace(/<[\/]?strong>/gi,"")
	result=result.replace(/<[\/]?ul>/gi,"")
	result=result.replace(/<li.*?>/gi,"")
	result=result.replace(/<[\/]li>/gi,"\r\n")
	result=result.replace(/<a[^>]*>(.*?)<\/a>/gi,"$1")
	result=result.replace(/<span[^>]*>(.*?)<\/span>/gi,"$1")
	result=result.replace(/&gt;/gi,">")
	result=result.replace(/&lt;/gi,"<")
	result=result.replace(/&nbsp;/gi,"")
	result=result.replace(/&amp;/gi,"&")
	return result

}
var cleanhtml2=function(html){

	var result=html.replace(/[^\x00-\x7F]/g, "")
	result=result.replace(/<p[^>]*?>(.*)?<\/p>/gi,"$1")
		result=result.replace(/<[\/]?strong>/gi,"")
	result=result.replace(/<ul[^>]*?>/gi,"")
	result=result.replace(/<\/ul[^>]*?>/gi,"")
	result=result.replace(/<li[^>]*?>(.*?)<\/li>/gi,"* $1\n\r")
	result=result.replace(/<a[^>]*>(.*?)<\/a>/gi,"$1")
	return result

}
var getkeys=function(key){
	var result=key.replace(/\s+/g,"_")
	result=result.replace(/[\W]+/g,"")
	return result;
}
function checkDirectorySync(directory) {  
  try {
    fs.statSync(directory);
  } catch(e) {
    fs.mkdirSync(directory);
  }
}
function getImageName(img){
	if(!(img.endsWith(".png")||img.endsWith(".jpg")||
		img.endsWith(".jpeg"))){
		return img+".png"
	}
	else{
		return img
	}
}
exports.cleanhtml1=cleanhtml1
exports.cleanhtml2=cleanhtml2
exports.getkeys=getkeys;
exports.bwde=bwde
exports.getImageName=getImageName
exports.checkDirectorySync=checkDirectorySync