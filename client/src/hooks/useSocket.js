import { useState, useEffect, useRef, useCallback } from 'react';





export default function useSocket(cb = null) {
  const client = useRef(null);
  const [open, setOpen] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [name, setName] = useState('anonymous');


  const handleOpen = useCallback(() => {
    if (client.current.readyState === 1) {
      setOpen(true);
    };
  }, [client, setOpen]);


  const handleClose = useCallback(() => {
    if (client.current.readyState === 3) {
      alert('socket closed!')
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
    localStorage.setItem('uuid', uuid);
    setUuid(uuid);
    setName(name);
  }, [setUuid, setName]);


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


  const startClient = useCallback(() => {
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
    if (process.env.REACT_APP_SOCKET_URL) {
      socketURI = process.env.REACT_APP_SOCKET_URL;
    };

    client.current = new WebSocket(socketURI);
    client.current.onopen = handleOpen;
    client.current.onclose = handleClose;
    client.current.onmessage = handleMessage;
  }, [client, handleOpen, handleClose, handleMessage]);


  useEffect(() => {
    if (!open || !client.current) {
      startClient();
    };
  }, [open, client, startClient]);


  const postMessage = useCallback((type, payload) => {
    if (!open || !uuid) {
      return null;
    };
    client.current.send(JSON.stringify({ type, payload, uuid }));
  }, [open, uuid, client]);


  const postName = useCallback(str => {
    postMessage('set_name', str);
  }, [postMessage]);


  return {
    active: open && !!uuid,
    post: postMessage,
    username: name,
    postUsername: postName,
  };
};
