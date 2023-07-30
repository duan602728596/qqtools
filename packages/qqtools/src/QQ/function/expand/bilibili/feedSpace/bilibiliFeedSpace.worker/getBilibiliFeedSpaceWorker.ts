export default function(): Worker {
  return new Worker(new URL('./bilibiliFeedSpace.worker.ts', import.meta.url));
}