import { useState, useEffect, useRef, useCallback } from 'react';





export default function useSocket(cb = null) {
  const client = useRef(null);
  const [open, setOpen] = useState(false);
  const [uuid, setUuid] = useState(null);


  const handleOpen = useCallback(() => {
    if (client.current.readyState === 1) {
      setOpen(true);
    };
  }, [client, setOpen]);

  const handleClose = useCallback(() => {
    if (client.current.readyState === 3) {
      setOpen(false);
    };
  }, [client, setOpen]);


  const checkUuid = useCallback(() => {
    const storedUuid = localStorage.getItem('uuid');
    const msg = { type: 'check_uuid', payload: storedUuid };
    client.current.send(JSON.stringify(msg));
  }, [client]);

  const storeUuid = useCallback(val => {
    localStorage.setItem('uuid', val);
    setUuid(val);
  }, [setUuid]);


  const handleMessage = useCallback(msg => {
    const { type, payload } = JSON.parse(msg.data);
    // console.log('useSocket got message', type, payload)

    switch (type) {
      case 'check_uuid':
        checkUuid();
        break;
      case 'store_uuid':
        storeUuid(payload);
        break;
      default:
        cb({ type, payload });
        return null;
    };
  }, [checkUuid, storeUuid, cb]);


  useEffect(() => {
    if (!client.current) {
      const loc = window.location;
      let socketURI;
      if (loc.protocol === 'https:') {
        socketURI = 'wss:';
      } else {
        socketURI = 'ws:';
      };
      socketURI += '//' + loc.host;
      socketURI += loc.pathname;

      if (process.env.NODE_ENV === 'development') {
        socketURI = 'ws://localhost:8080';
      };

      client.current = new WebSocket(socketURI);
      client.current.onopen = handleOpen;
      client.current.onclose = handleClose;
      client.current.onmessage = handleMessage;
    };
  }, [client, handleOpen, handleClose, handleMessage]);


  const postMessage = useCallback((type, payload) => {
    if (!open || !uuid) {
      return null;
    };
    client.current.send(JSON.stringify({ type, payload, uuid }));
  }, [open, uuid, client]);


  return {
    active: open && !!uuid,
    post: postMessage,
  };
};
