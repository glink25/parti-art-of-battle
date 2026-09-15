declare module '@parti/worker-sdk' {
  export function defineRoom(
    definition: import('./contracts').RoomDefinition,
  ): import('./contracts').RoomDefinition;
}
