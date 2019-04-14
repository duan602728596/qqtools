/* ajax */
function getData(method, url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.addEventListener('readystatechange', function(event) {
      if (xhr.status === 200 && xhr.readyState === 4) {
        const res = JSON.parse(xhr.response);

        resolve(res);
      }
    });
    xhr.send(data);
  }).catch((err) => {
    console.error(err);
  });
}

export default getData;