export default function(): SharedWorker {
  return new SharedWorker(new URL('./limiting.worker.ts', import.meta.url));
}