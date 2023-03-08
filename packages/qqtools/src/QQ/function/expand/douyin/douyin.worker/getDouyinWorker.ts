export default function(): Worker {
  return new Worker(new URL('./douyin.worker.ts', import.meta.url));
}