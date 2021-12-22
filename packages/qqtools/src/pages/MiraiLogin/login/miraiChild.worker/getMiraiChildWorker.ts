export default function(): Worker {
  return new Worker(new URL('./miraiChild.worker.ts', import.meta.url));
}