import Pusher from "pusher-js";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface PusherLike {
  subscribe: (channel: string) => {
    bind: (event: string, cb: (data: unknown) => void) => void;
    unbind_all: () => void;
  };
  unsubscribe: (channel: string) => void;
}

const noopChannel = { bind: () => {}, unbind_all: () => {} };
const noopPusher: PusherLike = {
  subscribe: () => noopChannel,
  unsubscribe: () => {},
};

let pusherInstance: PusherLike | null = null;

export function getPusher(): PusherLike {
  if (isDemo || !process.env.NEXT_PUBLIC_PUSHER_KEY) return noopPusher;
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    }) as unknown as PusherLike;
  }
  return pusherInstance;
}
