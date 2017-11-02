/* ajax */
function getData(method: string, url: string, data: string){
  return new Promise((resolve: Function, reject: Function): void=>{
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.addEventListener('readystatechange', function(event: Object): void{
      if(xhr.status === 200){
        try{
          const res: JSON = JSON.parse(xhr.response);
          resolve(res);
        }catch(err){
          // ！获取到的json虽然能够正常解析，但是会报格式错误，所以使用try来避免输出错误信息
        }
      }
    });
    xhr.send(data);
  });
}

export default getData;