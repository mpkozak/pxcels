import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';





export default function useSocket() {
  const [socketStatus, setSocketStatus] = useState(0);
  /*
    -1  starting up
    0   disconnected
    1   connected
    2   authenticated
  */

  const [user, setUser] = useState({
    uuid: localStorage.getItem('uuid') || '',
    username: localStorage.getItem('username') || '',
  });


  const client = useRef(null);
  const listener = useRef(null);


  const handleOpen = useCallback(() => {
    if (client.current.readyState === 1) {
      console.log('socket open');
      setSocketStatus(1);
    };
  }, [client, setSocketStatus]);


  const handleClose = useCallback(() => {
    if (client.current.readyState === 3) {
      console.log('socket closed');
      setSocketStatus(0);
    };
  }, [client, setSocketStatus]);


  const handleReqUuid = useCallback(() => {
    const { uuid } = user;
    client.current.send(JSON.stringify({ login: (uuid || 'new_user') }));
  }, [client, user]);


  const handleStoreUser = useCallback(val => {
    const { uuid, name } = val;
    localStorage.setItem('uuid', uuid);
    localStorage.setItem('username', name);
    setUser({ uuid, name });
    setSocketStatus(2);
  }, [setUser, setSocketStatus]);


  const handleMessage = useCallback(msg => {
    const { action, payload } = JSON.parse(msg.data);
    // console.log('useSocket got message', action, payload)

    switch (action) {
      case 'req_uuid':
        handleReqUuid();
        break;
      case 'store_user':
        handleStoreUser(payload);
        break;
      default:
        if (listener.current) {
          listener.current(action, payload);
        };
        return null;
    };
  }, [handleReqUuid, handleStoreUser, listener]);


  const startClient = useCallback(() => {
    // console.log('connecting socket...');
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


  const postMessage = useCallback((action, payload) => {
    const { uuid } = user;
    if (!socketStatus || !uuid) {
      return null;
    };
    client.current.send(JSON.stringify({ action, payload, uuid }));
  }, [socketStatus, user, client]);


  const addListener = useCallback((fn) => {
    listener.current = fn;
    return postMessage;
  }, [listener, postMessage]);


  useEffect(() => {    // connection initialize
    if (socketStatus === 0) {
      setSocketStatus(-1);
      startClient();
    };
  }, [socketStatus, setSocketStatus, startClient]);


  return {
    socketActive: socketStatus === 2,
    username: user.username,
    addListener,
    postMessage,
  };
};
