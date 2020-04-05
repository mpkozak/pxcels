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


  const handleRequestUuid = useCallback(() => {
    const storedUuid = localStorage.getItem('uuid');
    const msg = { type: 'check_uuid', payload: storedUuid };
    client.current.send(JSON.stringify(msg));
  }, [client]);


  const handleStoreUser = useCallback(val => {
    const { uuid, name } = val;
    // handle name storage;
    console.log('name', name)
    localStorage.setItem('uuid', uuid);
    setUuid(uuid);
  }, [setUuid]);


  const handleMessage = useCallback(msg => {
    const { type, payload } = JSON.parse(msg.data);
    // console.log('useSocket got message', type, payload)

    switch (type) {
      case 'request_uuid':
        handleRequestUuid();
        break;
      case 'store_user':
        handleStoreUser(payload);
        break;
      default:
        cb({ type, payload });
        return null;
    };
  }, [handleRequestUuid, handleStoreUser, cb]);


  useEffect(() => {
    if (!client.current) {
      const loc = window.location;
      let socketURI;
      if (loc.protocol === 'https:') {
        socketURI = 'wss:';
      } else {
        socketURI = 'ws:';
      };
      if (process.env.NODE_ENV === 'development') {
        const base = loc.host.split(':')[0];
        socketURI += `//${base}:8080`
      } else {
        socketURI += '//' + loc.host;
      };
      socketURI += loc.pathname;

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
