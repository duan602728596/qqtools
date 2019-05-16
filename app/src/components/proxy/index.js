export const name = 'proxy';

export function getProxy() {
  const value = localStorage.getItem(name);

  if (value) {
    return JSON.parse(value);
  } else {
    return value;
  }
}

export function setProxy(value) {
  return localStorage.setItem(name, JSON.stringify(value));
}

export function getProxyIp() {
  const value = localStorage.getItem(name);

  if (value) {
    const json = JSON.parse(value);

    return `${ json.protocol }://${ json.host }:${ json.port }`;
  } else {
    return value;
  }
}