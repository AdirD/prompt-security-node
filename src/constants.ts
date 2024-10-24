export const ProtectActions = {
    LOG: 'log',
    BLOCK: 'block',
    MODIFY: 'modify',
  } as const;
  
  export type ProtectAction = typeof ProtectActions[keyof typeof ProtectActions];
  