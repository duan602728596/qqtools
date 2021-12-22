export default function(): Worker {
  return new Worker(new URL('./bilibili.worker.ts', import.meta.url));
}