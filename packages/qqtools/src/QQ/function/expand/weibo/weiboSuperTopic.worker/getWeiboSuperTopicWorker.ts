export default function(): Worker {
  return new Worker(new URL('./weiboSuperTopic.worker.ts', import.meta.url));
}