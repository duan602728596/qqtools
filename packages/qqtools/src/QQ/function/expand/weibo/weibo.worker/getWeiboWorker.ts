export default function(): Worker {
  return new Worker(new URL('./weibo.worker.ts', import.meta.url));
}