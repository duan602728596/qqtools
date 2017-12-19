/* ajax */
function getData(method: string, url: string, data: string){
  return new Promise((resolve: Function, reject: Function): void=>{
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.addEventListener('readystatechange', function(event: Event): void{
      if(xhr.status === 200 && xhr.readyState === 4){
        const res: JSON = JSON.parse(xhr.response);
        resolve(res);
      }
    });
    xhr.send(data);
  });
}

export default getData;